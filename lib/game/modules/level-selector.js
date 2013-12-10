/**
 * The LevelSelector is the screen where a player selects the level in B mode.
 * It has its own controls, screen etc. and thus it makes sense to have
 * this in its own module.
 */
ig.module( 
	'game.modules.level-selector'
)
.requires(
	'impact.font',
    'game.entities.block',
    'game.entities.block-container',
    'game.modules.field-manager'
)
.defines(function() {

    LevelSelector = ig.Class.extend({
        
        font: new ig.Font( 'media/bitdust2_16.font.png' ),
        bg: new ig.Image('media/titlescreen.png'),
        
        soundSelect: new ig.Sound( 'media/sounds/stage-select.mp3' ),
        
        /**
         * The "SELECT LEVEL" text blinks, we need a timer for that
         */
        levelSelectBlinkTimer: new ig.Timer(),
        
        /**
         * All available levels in the screen.
         */
        selectedLevelIndex: 0,
<<<<<<< HEAD
        levels: [1, 2, 3, 4, 5],
=======
        levels: [0, 1, 2, 3, 4, 5],
>>>>>>> pr/2
                
        init: function() {

        },
             
        /**
         * Handle controls.
         */
        update: function() {
            if (ig.input.pressed('left')) {
                this.selectedLevelIndex = mmod(this.selectedLevelIndex - 1, this.levels.length);
                this.soundSelect.play();
            }
            else if (ig.input.pressed('right')) {
                this.selectedLevelIndex = mmod(this.selectedLevelIndex + 1, this.levels.length);
                this.soundSelect.play();
            }

            else if (ig.input.pressed('enter') || ig.input.pressed('rotateLeft') || ig.input.pressed('rotateRight')) {
                ig.game.startRound();
            }
        },
                
        draw: function() {
            this.bg.draw(0, 0);
            // blink the select stage font
            var blink = mmod(this.levelSelectBlinkTimer.delta(), 1.5); // speed of the non-showing state (1.1 = hidden only short)
            if (blink <= 1) {
<<<<<<< HEAD
                this.font.draw("SELECT LEVEL", ig.global.TILESIZE * 9, ig.global.TILESIZE * 12, ig.Font.ALIGN.CENTER);
=======
                this.font.draw("SELECT HEIGHT", ig.global.TILESIZE * 9, ig.global.TILESIZE * 12, ig.Font.ALIGN.CENTER);
>>>>>>> pr/2
            }
            
            var xOffset = 0;
        
            for (var i = 0; i < this.levels.length; i++) {
                var numberOut = this.levels[i];
                if (this.levels[i] === this.levels[this.selectedLevelIndex]) {
                    numberOut = '[' + numberOut + ']';
                }
<<<<<<< HEAD
                this.font.draw(numberOut, (ig.global.TILESIZE*5) + xOffset, (ig.global.TILESIZE*13) + ig.global.TILESIZE, ig.Font.ALIGN.CENTER);
=======
                this.font.draw(numberOut, (ig.global.TILESIZE*4) + xOffset, (ig.global.TILESIZE*13) + ig.global.TILESIZE, ig.Font.ALIGN.CENTER);
>>>>>>> pr/2
                xOffset += ig.global.TILESIZE * 2;
            }
        },
                
        getSelectedLevel: function() {
            return this.levels[this.selectedLevelIndex];
        }
        
    });
});
