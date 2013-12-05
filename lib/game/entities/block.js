/**
 * A block is the most basic entity in the game and contains all the information
 * you see on the screen. A block cannot exist by itself, however. It always
 * comes in a compound with other blocks. Blocks are organized into containers.
 */
ig.module( 
	'game.entities.block'
)
.requires(
    'impact.entity',
    'plugins.gridmovement'
)
.defines(function() {

    EntityBlock = ig.Entity.extend({
        
        size: { x: ig.global.TILESIZE, y: ig.global.TILESIZE},

        /**
         * Tetris has its own collision detection routine. This way, we take
         * it out of Impact's collision pool, which should make computing time
         * a tiny little bit faster.
         */
        collides: ig.Entity.COLLIDES.NEVER,
        
        /**
         * The animSheet is not clear yet and thus null. Once a new block is
         * spawned, the container/shape it belongs to tells the block how it
         * shoud look.
         * Note: This way, the animSheet is assigned dynamically and the
         * images for the blocks are NOT preloaded. We circumvent that in
         * main.js
         */
        animSheet: null,
        
        /**
         * The movement is handled by a plugin called GridMovement, see
         * lib/game/plugins/gridmovement.js
         */
        gridMover: null,
        
        /**
         * In the destroy state, the block starts its blinking animation
         */
        destroyState: false,
        
        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            this.gridMover = new GridMovement(this);
        },
             
        /**
         * Called by the container/shape
         */
        setColor: function( color ) {
            this.initAnim( color);
        },
              
        /**
         * Sets the animSheet dynamically
         */
        initAnim: function( color ) {
            switch (color) {
                case EntityBlock.color.COLOR_L:
                    this.animSheet = new ig.AnimationSheet( 'media/block-l.png', ig.global.TILESIZE, ig.global.TILESIZE);
                    break;    
                case EntityBlock.color.COLOR_S:
                    this.animSheet = new ig.AnimationSheet( 'media/block-s.png', ig.global.TILESIZE, ig.global.TILESIZE);
                    break;    
                case EntityBlock.color.COLOR_SQUARE:
                    this.animSheet = new ig.AnimationSheet( 'media/block-square.png', ig.global.TILESIZE, ig.global.TILESIZE);
                    break;
                case EntityBlock.color.COLOR_LINE:
                    this.animSheet = new ig.AnimationSheet( 'media/block-line.png', ig.global.TILESIZE, ig.global.TILESIZE);
                    break;                    
                case EntityBlock.color.COLOR_TRIANGLE:
                    this.animSheet = new ig.AnimationSheet( 'media/block-triangle.png', ig.global.TILESIZE, ig.global.TILESIZE);
                    break;    
                case EntityBlock.color.COLOR_LR:
                    this.animSheet = new ig.AnimationSheet( 'media/block-lr.png', ig.global.TILESIZE, ig.global.TILESIZE);
                    break;
                case EntityBlock.color.COLOR_SR:
                    this.animSheet = new ig.AnimationSheet( 'media/block-sr.png', ig.global.TILESIZE, ig.global.TILESIZE);
                    break;                    
                default: // should never happen
                    this.animSheet = new ig.AnimationSheet( 'media/single-block.png', ig.global.TILESIZE, ig.global.TILESIZE );
                    break;
            }
            this.addAnim( 'idle', 1, [0] );
            this.addAnim( 'blink', 0.07, [0,1,2,3,2,1] );
            // synchronize the timers of all blocks to use one single timer
            this.anims.blink.timer = EntityBlock.animationTimer;
        },
                
        update: function() {
            if (this.destroyState) {
                this.currentAnim = this.anims.blink;
            } else {
                this.currentAnim = this.anims.idle;
            }
            this.parent();
        },

        /**
         * Should never be called
         */
        check: function() {
            ig.log("COLLISION");
            this.parent();
        },

        moveLeft: function() {
            this.gridMover.move( GridMovement.direction.LEFT );
        },
        moveRight: function() {
            this.gridMover.move( GridMovement.direction.RIGHT );
        },    
        moveDown: function() {
            this.gridMover.move( GridMovement.direction.DOWN );
        },    
        canMoveLeft: function() {
            return this.gridMover.canMove( GridMovement.direction.LEFT );
        },
        canMoveRight: function() {
            return this.gridMover.canMove( GridMovement.direction.RIGHT);
        },
        canMoveDown: function() {
            return this.gridMover.canMove( GridMovement.direction.DOWN);
        },
                
        /**
         * Locks a block in. That means: Add it to the collision map
         */
        lock: function() {
            var currentTile = this.getCurrentTile();
            ig.game.collisionMap.data[currentTile.y][currentTile.x] = 1;
        },
                
        /**
         * Removes itself from the collision map. This happens if a line is
         * cleared this block belongs to
         */
        freeCollisionMap: function() {
            var currentTile = this.getCurrentTile();
            ig.game.collisionMap.data[currentTile.y][currentTile.x] = 0;
        },
                
        /**
         * Checks if the block now overlaps with the collision map. This is used
         * by block rotation. See block-container.js -> blocksHaveCollision()
         */
        overlapsCollisionMap: function() {
            var currentTile = this.getCurrentTile();
            return ig.game.collisionMap.data[currentTile.y][currentTile.x] !== 0;
        },
                
        /**
         * Returns the absolute tile on the screen
         */
        getCurrentTile: function() {
            return {x: Math.round(this.pos.x / ig.global.TILESIZE),
                    y: Math.round(this.pos.y / ig.global.TILESIZE)};
        },
                
        startDestruction: function() {
            this.destroyState = true;
        }
    });
    
    EntityBlock.color = {
        'COLOR_L' : '1',
        'COLOR_LR' : '2',
        'COLOR_LINE' : '3',
        'COLOR_S' : '4',
        'COLOR_SR' : '5',
        'COLOR_SQUARE' : '6',
        'COLOR_TRIANGLE' : '7'
    },
    
    // used to synchronize all blinking animations of all blocks
    EntityBlock.animationTimer = new ig.Timer();
});