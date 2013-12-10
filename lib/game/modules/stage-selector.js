/**
 * The StageSelector is the screen where a player selects the starting stage.
 * It has its own controls, screen etc. and thus it makes sense to have
 * this in its own module.
 */
ig.module( 
	'game.modules.stage-selector'
)
.requires(
	'impact.font',
    'game.entities.block',
    'game.entities.block-container',
    'game.modules.field-manager'
)
.defines(function() {

    StageSelector = ig.Class.extend({
        
        font: new ig.Font( 'media/bitdust2_16.font.png' ),
        bg: new ig.Image('media/titlescreen.png'),
        
        soundSelect: new ig.Sound( 'media/sounds/stage-select.mp3' ),
        
        /**
         * The "SELECT STAGE" text blinks, we need a timer for that
         */
        stageSelectBlinkTimer: new ig.Timer(),
        
        /**
         * All available stages in the screen. You could modify this
         * like so: [1, 2, 4, 8, 16, 32] if you wanted to give a
         * player different starting stages.
         */
        selectedStageIndex: 0,
        stages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                
        init: function() {

        },
             
        /**
         * Handle controls.
         */
        update: function() {
            if (ig.input.pressed('left')) {
                this.selectedStageIndex = mmod(this.selectedStageIndex - 1, this.stages.length);
                this.soundSelect.play();
            }
            else if (ig.input.pressed('right')) {
                this.selectedStageIndex = mmod(this.selectedStageIndex + 1, this.stages.length);
                this.soundSelect.play();
            }
            // moving down is the same as going 5 stages to the right. This applies only if there
            // are 10 stages!
            else if (ig.input.pressed('down')) {
                this.selectedStageIndex = mmod(this.selectedStageIndex + 5, this.stages.length);
                this.soundSelect.play();
            }
            else if (ig.input.pressed('up')) {
                this.selectedStageIndex = mmod(this.selectedStageIndex - 5, this.stages.length);
                this.soundSelect.play();
            }
                    
            else if (ig.input.pressed('enter') || ig.input.pressed('rotateLeft') || ig.input.pressed('rotateRight')) {
                if (ig.game.modeSelector.getSelectedMode() == 'A') {
                    ig.game.startRound();
                } else {
                    ig.game.gameState = MyGame.state.LEVEL_SELECT;
                }
            }
        },
                
        draw: function() {
            this.bg.draw(0, 0);
            // blink the select stage font
            var blink = mmod(this.stageSelectBlinkTimer.delta(), 1.5); // speed of the non-showing state (1.1 = hidden only short)
            if (blink <= 1) {
                this.font.draw("SELECT STAGE", ig.global.TILESIZE * 9, ig.global.TILESIZE * 12, ig.Font.ALIGN.CENTER);
            }
            
            var xOffset = 0,
                yOffset = 0;
        
            for (var i = 0; i < this.stages.length; i++) {
                xOffset += ig.global.TILESIZE * 2;
                if (mmod(i, 5) === 0) {
                    xOffset = 0;
                    yOffset += ig.global.TILESIZE;
                }
                var numberOut = this.stages[i];
                if (this.stages[i] === this.stages[this.selectedStageIndex]) {
                    numberOut = '[' + numberOut + ']';
                }
                this.font.draw(numberOut, (ig.global.TILESIZE*5) + xOffset, (ig.global.TILESIZE*13) + yOffset, ig.Font.ALIGN.CENTER);
                
            }
        },
                
        getSelectedStage: function() {
            return this.stages[this.selectedStageIndex];
        }
        
    });
});