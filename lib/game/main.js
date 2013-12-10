/**
 * CONSTANTS
 */
ig.global.TILESIZE = 16;
ig.global.FIELD_COLS = 10;
ig.global.FIELD_ROWS = 19; // the actual playing area is 10x18, but the top row is required for the line-shaped block 
ig.global.SHAPES = 7;
ig.global.SPAWN_POS_X = 240;
ig.global.SPAWN_POS_Y = 256;
ig.global.DROP_POS_X = 64;
ig.global.DROP_POS_Y = 32;
ig.global.PRESSED_DELAY = 0.25;
ig.global.REPEAT_LEFT_RIGHT_DELAY = 0.07;
ig.global.REPEAT_DOWN_DELAY = 0.05;
ig.global.LOCKIN_DELAY = 0.5;
ig.global.SPEED_INCREASE_PER_STAGE = 0.4;
ig.global.CLEAN_LINES_DELAY = 1.1;
ig.global.NOISE_CHANCE = 0.5;
<<<<<<< HEAD
=======
ig.global.NOISE_ROWS_PER_LEVEL = 2;
ig.global.MODEB_INIT_ROWS = 1;
>>>>>>> pr/2

ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
    /*'impact.debug.debug',*/
    'impact.font',
    
    'game.modules.round-manager',
    'game.modules.mode-selector',
    'game.modules.stage-selector',
    'game.modules.level-selector',
    
    'game.levels.main'
    
)
.defines(function(){

MyGame = ig.Game.extend({
	
    font: new ig.Font( 'media/04b03.font.png' ),        
    
    roundManager: null,
    modeSelector: null,
    stageSelector: null,
    levelSelector: null,
    gameState: null,
    
    roundCounter: 0,
    
    /**
     * This property is never used. It's just to ensure that the block images
     * land in the cache when the game preloads, because in block.js, they're loaded
     * dynamically. Since Impact caches all media, it's effectively loaded only once.
     */
    blockImageCache: [
        new ig.AnimationSheet( 'media/block-l.png', ig.global.TILESIZE, ig.global.TILESIZE),
        new ig.AnimationSheet( 'media/block-s.png', ig.global.TILESIZE, ig.global.TILESIZE),
        new ig.AnimationSheet( 'media/block-square.png', ig.global.TILESIZE, ig.global.TILESIZE),
        new ig.AnimationSheet( 'media/block-line.png', ig.global.TILESIZE, ig.global.TILESIZE),
        new ig.AnimationSheet( 'media/block-triangle.png', ig.global.TILESIZE, ig.global.TILESIZE),
        new ig.AnimationSheet( 'media/block-lr.png', ig.global.TILESIZE, ig.global.TILESIZE),
        new ig.AnimationSheet( 'media/block-sr.png', ig.global.TILESIZE, ig.global.TILESIZE),
        new ig.AnimationSheet( 'media/single-block.png', ig.global.TILESIZE, ig.global.TILESIZE)        
    ],
    	
	init: function() {
        this.gameState = MyGame.state.INIT;
        ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
        ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
        ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
        ig.input.bind(ig.KEY.UP_ARROW, 'up');
        ig.input.bind(ig.KEY.C, 'rotateRight');
        ig.input.bind(ig.KEY.X, 'rotateLeft');
        ig.input.bind(ig.KEY.P, 'pause');
        ig.input.bind(ig.KEY.ENTER, 'enter');
        ig.input.bind(ig.KEY.M, 'toggleMusic');

        this.gameState = MyGame.state.MODE_SELECT;
        this.modeSelector = new ModeSelector();
        this.stageSelector = new StageSelector();
        this.levelSelector = new LevelSelector();
	},
	
	update: function() {
		this.parent();
        
        switch( this.gameState ) {
            case MyGame.state.INIT:
                break;
            case MyGame.state.ROUND_RUNNING:
                this.roundManager.update();
                break;
            case MyGame.state.STAGE_SELECT:
                this.stageSelector.update();
                break;
            case MyGame.state.LEVEL_SELECT:
                this.levelSelector.update();
                break;
            default:
                this.modeSelector.update();
                break;
        }
	},
    
	draw: function() {
        // Draw all entities and backgroundMaps
		this.parent();
        
        switch( this.gameState ) {
            case MyGame.state.INIT:
                break;
            case MyGame.state.ROUND_RUNNING:
                this.roundManager.draw();
                break;
            case MyGame.state.STAGE_SELECT:
                this.stageSelector.draw();
                break;
            case MyGame.state.LEVEL_SELECT:
                this.levelSelector.draw();
                break;
            default:
                this.modeSelector.draw();
                break;
        }
    },
            
    startRound: function() {
        this.loadLevel( ig.copy(LevelMain) );
        this.roundManager = new RoundManager( ++this.roundCounter );
<<<<<<< HEAD
        this.roundManager.startRound( this.modeSelector.getSelectedMode(), this.stageSelector.getSelectedStage() );
=======
        this.roundManager.startRound( this.modeSelector.getSelectedMode(),
                                      this.stageSelector.getSelectedStage(),
                                      this.levelSelector.getSelectedLevel());
>>>>>>> pr/2
        this.gameState = MyGame.state.ROUND_RUNNING;
    },

    endRound: function() {
        this.gameState = MyGame.state.MODE_SELECT;
        this.roundManager = null;
        delete this.roundManager;
    },
            
    gameOver: function( roundScore, modeBInitialLevel ) {
        if (typeof ig.setScoreCallback === 'function') {
            ig.setScoreCallback( roundScore, this.finalizeScore( roundScore ), modeBInitialLevel );
        }
    },
                        
    /**
     * In my version of Tetris, this function creates a token by doing a bit
     * of Math. This helps to make the global scoreboard less prone to hacking.
     * Here, I stripped it.
     */
    finalizeScore: function( score ) {
        return score;
    }
});

MyGame.state = {
    'INIT': 1,
    'MODE_SELECT': 2,
    'STAGE_SELECT': 4,
    'LEVEL_SELECT': 8,
    'ROUND_RUNNING': 16
};

/**
 * Custom loader that uses percentage and my title screen as background
 */
MyLoader = ig.Loader.extend({

    bg: new ig.Image('media/titlescreen.png'),
    
    draw: function() {
        // This one clears the screen and draws the 
        // percentage loaded as text
        var w = ig.system.realWidth;
        var h = ig.system.realHeight;

        // Add your drawing code here
        this.bg.draw(0, 0);

        var percentage = (this.status * 100).round() + '%';
        ig.system.context.fillStyle = '#ffffff';
        ig.system.context.fillText( percentage, w/2.5,  h/1.5 );
    }
});

/**
 * You can disable all sound effects like that, for debugging only.
 */
//ig.Sound.enabled = false;

// Start the game with 60fps, 352x320, scale=2, custom loader
ig.main( '#canvas', MyGame, 60, 352, 320, 2, MyLoader );

});

/**
 * JavaScript's mod is kind of broken and doesn't work with negative numbers.
 * Thus, we implement our own that works with negative numbers as well.
 * Example:
 *          -1 % 4 == -1   <-- wrong
 *     mmod(-1, 4) == 3    <-- desired result
 */
function mmod(m, n) {
        return ((m % n) + n) % n;
}