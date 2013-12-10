/**
 * The ModeSelector is the screen where a player selects the mode.
 * It has its own controls, screen etc. and thus it makes sense to have
 * this in its own module.
 */
ig.module( 
	'game.modules.mode-selector'
)
.requires(
	'impact.font',
    'game.entities.block',
    'game.entities.block-container',
    'game.modules.field-manager'
)
.defines(function() {

    ModeSelector = ig.Class.extend({
        
        font: new ig.Font( 'media/bitdust2_16.font.png' ),
        bg: new ig.Image('media/titlescreen.png'),
        
        soundSelect: new ig.Sound( 'media/sounds/stage-select.mp3' ),
        
        /**
         * The "SELECT MODE" text blinks, we need a timer for that
         */
        modeSelectBlinkTimer: new ig.Timer(),
        
        /**
         * All available modes in the screen.
         */
        selectedModeIndex: 0,
        modes: ['A', 'B'],
                
        init: function() {

        },
             
        /**
         * Handle controls.
         */
        update: function() {
            if (ig.input.pressed('left')) {
                this.selectedModeIndex = mmod(this.selectedModeIndex - 1, this.modes.length);
                this.soundSelect.play();
            }
            else if (ig.input.pressed('right')) {
                this.selectedModeIndex = mmod(this.selectedModeIndex + 1, this.modes.length);
                this.soundSelect.play();
            }

            else if (ig.input.pressed('enter') || ig.input.pressed('rotateLeft') || ig.input.pressed('rotateRight')) {
                ig.game.gameState = MyGame.state.STAGE_SELECT;
            }
        },
                
        draw: function() {
            this.bg.draw(0, 0);
            // blink the select stage font
            var blink = mmod(this.modeSelectBlinkTimer.delta(), 1.5); // speed of the non-showing state (1.1 = hidden only short)
            if (blink <= 1) {
                this.font.draw("SELECT MODE", ig.global.TILESIZE * 9, ig.global.TILESIZE * 12, ig.Font.ALIGN.CENTER);
            }
            
            var xOffset = ig.global.TILESIZE;
        
            for (var i = 0; i < this.modes.length; i++) {
                xOffset += ig.global.TILESIZE * 2;
                var numberOut = this.modes[i];
                if (this.modes[i] === this.modes[this.selectedModeIndex]) {
                    numberOut = '[' + numberOut + ']';
                }
                this.font.draw(numberOut, (ig.global.TILESIZE*5) + xOffset, (ig.global.TILESIZE*13) + ig.global.TILESIZE, ig.Font.ALIGN.CENTER);
                
            }
        },
                
        getSelectedMode: function() {
            return this.modes[this.selectedModeIndex];
        }
        
    });
});
