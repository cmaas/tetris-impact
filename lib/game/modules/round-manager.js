/**
 * The round manager handles everything related to one round in the game.
 * It keeps track of the score, lines cleared, the current stage, speed
 * of auto-dropping a block, plays sounds, handles controls etc.
 */

ig.module( 
	'game.modules.round-manager'
)
.requires(
	'impact.font',
    
    'game.entities.block',
    'game.entities.block-container',
    'game.entities.block-shape-l',
    'game.entities.block-shape-lr',
    'game.entities.block-shape-line',
    'game.entities.block-shape-square',
    'game.entities.block-shape-s',
    'game.entities.block-shape-sr',
    'game.entities.block-shape-triangle',

    'game.modules.field-manager'
)
.defines(function() {

    RoundManager = ig.Class.extend({
        /**
         * Fonts
         */
        font: new ig.Font( 'media/bitdust2_16.font.png' ),        

        /**
         * Sounds
         */
        soundForceHit: new ig.Sound( 'media/sounds/force-hit.mp3' ),
        soundSlowHit: new ig.Sound( 'media/sounds/slow-hit.mp3' ),
        soundLineDrop: new ig.Sound( 'media/sounds/slow-hit.mp3' ),
        soundLineRemoval: new ig.Sound( 'media/sounds/line-removal.mp3' ),
        soundLineRemoval4: new ig.Sound( 'media/sounds/line-removal4.mp3' ),
        soundGameOver: new ig.Sound( 'media/sounds/gameover.mp3' ),
        // removed bgMusic, because I licensed it
        /*bgMusic: new ig.Sound( 'media/sounds/music01.mp3', false ),*/
        
        /**
         * activeBlock is the one controlled by the player
         */
        activeBlock: null,
        
        /**
         * nextBlock is the block in the preview window
         */
        nextBlock: null,
    
        /**
         * We need a bunch of timers
         */
        timerLeftRight: null, // limits how often the input.pressed state can fire for left and right
        timerDown: null, // pieces travel down a bit faster than left and right
        timerAutoDown: null, // timer that puts a piece down automatically
        timerLock: null, // there's a short delay after a piece has landed and before it is finally locked in
        timerDestruction: null, // the period of time the line destruction animation is running

        /**
         * Tracks if the piece landed and we're still waiting for the lock in timer
         */
        lockTimerRunning: false,
        
        /**
         * After a piece has landed, the down-button won't fire automatically. It must be released to
         * move pieces down again
         */
        forceButtonDownRelease: false,

        /**
         * Stage we're in
         */
        stage: 1,
        startStage: 1,        
        fallSpeed: 1.1,
        
        /**
         * The round itself is a state machine. Depending on the state, we
         * handle controls a bit different. If the round is GAME_OVER,
         * pressing X or C doesn't rotate a block but goes back to the
         * stage selection screen etc.
         */
        roundState: null,

        /**
         * Handles everything related to the map, e. g. collision
         */
        fieldManager: null,

        /**
         * Temporarily store all lines that are full and need to be cleared
         */
        currentFullRows: null,
        
        /**
         * Score-related stuff
         */
        lineCount: 0,
        score: 0,
        
        /**
         * If you keep DOWN pressed, you get points according to the amount of
         * lines traveled. We need to keep track of the line when the player
         * presses DOWN
         */
        linesPosOnKeyDown: 0,
        
        /**
         * "PLEASE TRY AGAIN" blinks, we need a timer for that
         */
        gameOverBlinkTimer: new ig.Timer(),
        
        /**
         * Keeps track which round we're in. This is for debugging only
         */
        round: 0,
        
        /**
         * Background music can be toggled
         */
        playBgMusic: true,

        init: function( round ) {
            this.round = round;
            
            this.activeBlock = null;
            this.nextBlock = null;
            
            this.roundState = RoundManager.state.INIT;
            // we need a few different timers
            this.timerLeftRight = new ig.Timer();
            this.timerDown = new ig.Timer();
            this.timerAutoDown = new ig.Timer();
            this.timerLock = new ig.Timer();
            this.timerLock.pause();
            this.timerDestruction = new ig.Timer();
            this.timerDestruction.pause();

            this.fieldManager = new FieldManager();
            
            //ig.music.add( this.bgMusic );
        },
            
        update: function() {
            // depending on the current state, handle controls differently
            switch(this.roundState) {
                case RoundManager.state.GAME_OVER:
                    this.handleGameOverControls();
                    break;
                case RoundManager.state.ANIM_CLEAN_LINES:
                    this.handleCleanLines();
                    break;
                case RoundManager.state.INIT:
                    break;
                default:
                    this.handleControls();
            }
        },
                
        draw: function() {
            switch (this.roundState) {
                case RoundManager.state.GAME_OVER:
                    this.handleGameOver();
                    break;
                case RoundManager.state.RUNNING:
                    break;
                default:
                    break;
            }
            // always draw scoreboard
            this.font.draw(this.stage, 304, 31, ig.Font.ALIGN.RIGHT);
            this.font.draw(this.lineCount, 304, 95, ig.Font.ALIGN.RIGHT);
            this.font.draw(this.score, 304, 159, ig.Font.ALIGN.RIGHT);            
            
        },
                
        handleGameOver: function() {
            this.font.draw('GAME OVER', 96, 64, ig.Font.ALIGN.CENTER);
            var blink = mmod(this.gameOverBlinkTimer.delta(), 1.5); // speed of the non-showing state (1.1 = hidden only short)
            if (blink <= 1) {
                this.font.draw("PLEASE\nTRY\nAGAIN\n\n(PRESS X)", ig.global.TILESIZE * 6, ig.global.TILESIZE * 8, ig.Font.ALIGN.CENTER);
            }

            // ending a game is: if new block spawned and couldn't move and no lines cleaned.
            // or: new block spawned, no move, another block spawned, still no move
            // or: new block spawned, no move, overlaps with other block
        },
                
        /**
         * Check if we can remove the lines that were marked for clearing and if
         * they blinked enough already.
         */
        handleCleanLines: function() {
            if (this.timerDestruction.delta() >= 0) {
                this.fieldManager.cleanFullRows( this.currentFullRows );
                this.currentFullRows = [];
                this.roundState = RoundManager.state.RUNNING;
                this.timerDestruction.pause();
                this.soundLineDrop.play();
                this.makeNextBlockActive();
                this.generateBlock();
            }
        },
                
        handleGameOverControls: function() {
            if (ig.input.pressed('rotateRight') ||
                ig.input.pressed('rotateLeft') ||
                ig.input.pressed('enter')) {
                ig.game.endRound();
            }
        },
                
        /**
         * This is probably the most important and crucial part of the game.
         * The input controls of Tetris. Please refer to the tutorial for more
         * information.
         */
        handleControls: function() {
            ig.show('forceButtonDownRelease', this.forceButtonDownRelease);
            if (this.activeBlock === null || this.activeBlock.isInitialized() === false) {
                return;
            }
            if (this.roundState !== RoundManager.state.RUNNING) {
                return;
            }
            
            if (ig.input.pressed('toggleMusic')) {
                if (this.playBgMusic) {
                    this.playBgMusic = false;
                    //ig.music.fadeOut(0.5);
                } else {
                    this.playBgMusic = true;
                    //ig.music.play();
                }
            }
            
            // lock a piece if the lock-in-timer runs out
            if (this.lockTimerRunning && this.timerLock.delta() >= ig.global.LOCKIN_DELAY) {
                // last check: we would lock now, but don't do it, if for some reason the piece can still move
                // (happens if it was rotated or moved horizontally after lockin-sequence started)
                if (this.activeBlock.canMoveDown()) {
                    this.timerLock.pause();
                    this.lockTimerRunning = false;
                }
                else {
                    this.lockActiveBlock();
                }
            }
            
            // rotation: pretty straight forward. rotate once per key press
            if (ig.input.pressed('rotateRight')) {
                this.activeBlock.rotateRight();
            }
            if (ig.input.pressed('rotateLeft')) {
                this.activeBlock.rotateLeft();
            }
            
            
            var timerSetThisTick = false;
            
            // once pressed, add a micro delay before we trigger repeated moving
            if (ig.input.pressed('left')) {
                this.timerLeftRight.set( ig.global.PRESSED_DELAY );
                this.activeBlock.moveLeft();
                timerSetThisTick = true;
                this.forceButtonDownRelease = true;
            }
            else if (ig.input.pressed('right')) {
                this.timerLeftRight.set( ig.global.PRESSED_DELAY );
                this.activeBlock.moveRight();
                timerSetThisTick = true;
                this.forceButtonDownRelease = true;
            }
            
            // both keys pressed, don't move anything
            if (ig.input.state('left') && ig.input.state('right')) {
                this.timerLeftRight.set( ig.global.PRESSED_DELAY );
                timerSetThisTick = true;
            }
            
            if (ig.input.released('left') || ig.input.released('right')) {
                this.forceButtonDownRelease = false;
            }
            
            // continuous moving, if button is still pressed down
            if (ig.input.state('left') && this.timerLeftRight.delta() >= 0 && !timerSetThisTick) {
                this.timerLeftRight.set( ig.global.REPEAT_LEFT_RIGHT_DELAY );
                this.activeBlock.moveLeft();
                this.forceButtonDownRelease = true;
            }
            if (ig.input.state('right') && this.timerLeftRight.delta() >= 0 && !timerSetThisTick) {
                this.timerLeftRight.set( ig.global.REPEAT_LEFT_RIGHT_DELAY );
                this.activeBlock.moveRight();
                this.forceButtonDownRelease = true;
            }

            // pressed-down state is per-block only. if a new block spawns, the button must be released
            if (
                    ig.input.state('down') && this.forceButtonDownRelease === false && this.timerDown.delta() >= 0) {
                this.timerDown.set( ig.global.REPEAT_DOWN_DELAY );
                //this.timerLeftRight.set(0);
                // records traveling distance. required for press-down scoring
                if (this.linesPosOnKeyDown === 0) {
                    this.linesPosOnKeyDown = this.activeBlock.pos.y;
                }
                // if we "slam down" the block and it can't go further, immediately lock it
                var movedManually = this.activeBlock.moveDown();
                if (movedManually === false) {
                    this.scoreTravelDistance();
                    this.lockActiveBlock( true );
                }
            }
            // if the down-button is not pressed anymore toggle state to allow continuous block-movement
            else if (this.forceButtonDownRelease && ig.input.state('down') === false) {
                this.forceButtonDownRelease = false;
            }

            // as long as the button-down key is not pressed (or pressed, but forced to be released), auto-move pieces down
            if (!(ig.input.state('down') && this.forceButtonDownRelease === false ) && this.timerAutoDown.delta() >= (1 / this.fallSpeed)) {
                var moved = this.activeBlock.moveDown();
                this.timerAutoDown.set(0);
                if (moved === false && this.lockTimerRunning === false) {
                    this.timerLock.set(0);
                    this.timerLock.unpause();
                    this.lockTimerRunning = true;
                } else if (moved) {
                    this.timerLock.pause();
                    this.lockTimerRunning = false;
                }
            }
                       
            // if the user lets go of the down-button, he doesn't score any points.
            // thus, we reset the traveled-lines tracker
            if (ig.input.released('down')) {
                this.linesPosOnKeyDown = 0;
                this.timerAutoDown.set(0);
            }
        },
        
        scoreTravelDistance: function() {
            var traveledLines = Math.floor((this.activeBlock.pos.y - this.linesPosOnKeyDown) / ig.global.TILESIZE);
            this.score += traveledLines;
            this.linesPosOnKeyDown = 0;
        },
        
        lockActiveBlock: function( forcefulSound ) {
            if (forcefulSound) {
                this.soundForceHit.play();
            } else {
                this.soundSlowHit.play();
            }
            this.forceButtonDownRelease = true;
            this.fieldManager.lockBlock( this.activeBlock );
            var fullLines = this.fieldManager.checkFullLines();
            var countFullLines = fullLines.length;
            // handle line clearing: count score, start blink animation, play sounds
            if (countFullLines > 0) {
                this.currentFullRows = fullLines;
                this.lineCount += countFullLines;
                this.score += this.getLineClearingScore( countFullLines );
                this.roundState = RoundManager.state.ANIM_CLEAN_LINES;
                this.fieldManager.startLineDestruction( fullLines );
                this.timerDestruction.set( ig.global.CLEAN_LINES_DELAY ); // todo: make constant
                this.timerDestruction.unpause();
                this.checkAdvanceStageCondition();
                // play different sound if 4 lines are cleared
                if (countFullLines >= 4) {
                    this.soundLineRemoval4.play();
                } else {
                    this.soundLineRemoval.play();
                }
            }
            // no lines cleared, just trigger a new block
            else {
                this.makeNextBlockActive();
                this.generateBlock();                
            }
            this.lockTimerRunning = false;
            this.timerLock.pause();
        },

        checkAdvanceStageCondition: function() {
            var tmp = (this.lineCount + (this.startStage - 1) * 10) - this.stage * 10;
            if (tmp >= 0 && tmp < 10) {
                this.advanceStage();
            }
        },

        /**
         * Randomly generate a new block and place it in the preview window.
         * Note that different shapes require different offsets
         */
        generateBlock: function() {
            ig.log("GENERATE BLOCK IN " + this.round);
            var num = Math.floor(Math.random() * ig.global.SHAPES + 1);
            var entity = null;
            var xOffset = 0, yOffset = 0;
            switch (num) {
                case 1:
                    // line requires offset, because it has two empty rows in its shape
                    yOffset = ig.global.TILESIZE * -2;
                    entity = ig.game.spawnEntity( EntityBlockShapeLine, ig.global.SPAWN_POS_X, ig.global.SPAWN_POS_Y + yOffset );
                    break;
                case 2:
                    xOffset = ig.global.TILESIZE; // positive offset
                    entity = ig.game.spawnEntity( EntityBlockShapeSquare, ig.global.SPAWN_POS_X + xOffset, ig.global.SPAWN_POS_Y );
                    break;
                case 3:
                    // triangle requires offset, because it has an empty row in its shape
                    yOffset = ig.global.TILESIZE * -1;
                    entity = ig.game.spawnEntity( EntityBlockShapeTriangle, ig.global.SPAWN_POS_X, ig.global.SPAWN_POS_Y + yOffset );
                    break;
                case 4:
                    // L requires offset, because it has an empty row in its shape
                    yOffset = ig.global.TILESIZE * -1;
                    entity = ig.game.spawnEntity( EntityBlockShapeL, ig.global.SPAWN_POS_X, ig.global.SPAWN_POS_Y + yOffset );
                    break;
                case 5:
                    // LR requires offset, because it has an empty row in its shape
                    yOffset = ig.global.TILESIZE * -1;
                    entity = ig.game.spawnEntity( EntityBlockShapeLR, ig.global.SPAWN_POS_X, ig.global.SPAWN_POS_Y + yOffset );
                    break;
                case 6:
                    entity = ig.game.spawnEntity( EntityBlockShapeS, ig.global.SPAWN_POS_X, ig.global.SPAWN_POS_Y );
                    break;
                default:
                    entity = ig.game.spawnEntity( EntityBlockShapeSR, ig.global.SPAWN_POS_X, ig.global.SPAWN_POS_Y );
                    break;
            }
            entity.spawnOffset.x = xOffset;            
            entity.spawnOffset.y = yOffset;  
            this.nextBlock = entity;
        },
               
        /**
         * Pass control to the block in the preview window and teleport that
         * block into the main game area.
         */
        makeNextBlockActive: function() {
            this.activeBlock = this.nextBlock;
            var newPos = {x: ig.global.DROP_POS_X + this.activeBlock.spawnOffset.x, y: ig.global.DROP_POS_Y + this.activeBlock.spawnOffset.y};
            this.activeBlock.teleportPos( newPos );
            this.handleSpawnEndGameCondition();
            this.nextBlock = null;
            this.timerAutoDown.set(0);
            this.timerDown.set(0);
        },
                
        /**
         * If the active block is moved to the game area and overlaps
         * immediately without movement, end the game.
         */
        handleSpawnEndGameCondition: function() {
            if (this.activeBlock.blocksHaveCollision()) {
                this.roundState = RoundManager.state.GAME_OVER;
                this.soundGameOver.play();
                if (this.playBgMusic) {
                    //ig.music.fadeOut(1);
                }
                ig.log("YOU LOST");
                ig.game.gameOver( this.score );
            }
        },

        getLineClearingScore: function( linesCleared ) {
            var lineScore = 0;
            switch (linesCleared) {
                case 4: lineScore = 1200 * this.stage; break;
                case 3: lineScore = 300 * this.stage; break;
                case 2: lineScore = 100 * this.stage; break;
                default: lineScore = 40 * this.stage; break;
            }
            return lineScore;
        },
                
        /**
         * Generates the first block, sets it active and then generates another block
         * as "preview". Sets round state to RUNNING
         */
        startRound: function( startStage ) {
            this.startStage = startStage;
            if (this.startStage > 1) {
                var diff = this.startStage - this.stage;
                ig.log("DIFF: " + diff);
                this.advanceStage( diff );
            }
            this.generateBlock();
            this.makeNextBlockActive();
            this.generateBlock();
            this.roundState = RoundManager.state.RUNNING;
            if (this.playBgMusic) {
                //ig.music.volume = 0.25;
                //ig.music.play();
            }
        },
                
        /**
         * Enter next stage, increase the speed.
         */
        advanceStage: function( amountOfStages ) {
            if (amountOfStages <= 0 || amountOfStages === null || amountOfStages === undefined) {
                amountOfStages = 1;
            }
            ig.log("+STAGES: " + amountOfStages);
            this.stage += amountOfStages;
            this.fallSpeed += (ig.global.SPEED_INCREASE_PER_STAGE * amountOfStages);
            ig.log("STAGE: " + this.stage);
            ig.log("SPEED: " + this.fallSpeed );
        }
    });
    
    RoundManager.state = {
        'INIT': 1,
        'GET_READY': 2,
        'RUNNING': 4,
        'PAUSE': 8,
        'GAME_OVER': 16,
        'ANIM_CLEAN_LINES': 32
    };
});