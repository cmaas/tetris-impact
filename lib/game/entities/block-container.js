/**
 * The BlockContainer is the base class for all pieces (shapes), because all
 * pieces share the same methods and properties. What makes a piece different
 * from another piece is only its shape, its color and the way it rotates.
 */
ig.module( 
	'game.entities.block-container'
)
.requires(
	'impact.entity',
    'game.entities.block'
)
.defines(function() {

    EntityBlockContainer = ig.Entity.extend({
        
        soundRotate: new ig.Sound( 'media/sounds/block-rotate.mp3' ),
        
        /**
         * The size is somewhat arbitraty. It's not really needed, since
         * EntityBlockContainer is purely abstract and never shown
         */
        size: { x: ig.global.TILESIZE * 4, y: ig.global.TILESIZE * 4},
        
        /**
         * Set collision to NEVER to improve performance and take this entity out
         * of the engine's collision handling. We do collision handling ourselves.
         */
        collides: ig.Entity.COLLIDES.NEVER,
        
        /**
         * Some actual shapes require a slightly different spawn location.
         * E. g., the square is shifted to the right, the line a bit up, etc.
         */
        spawnOffset: { x: 0, y: 0},
        
        /**
         * Block rotation is a state machine. It cycles through a predefined set of possible rotations.
         */
        rotationState: 0,
        
        /**
         * Must be overwritten by the inheriting child - the actual shape
         */
        rotationShapes: [],
        
        /**
         * Store the length of the rotationShapes array for later reference
         */
        rotationStates: 0,
        
        /**
         * Holds the entitites
         */
        blocks: [],
        
        /**
         * EntityBlockContainer has an initialized state. It's only true, if all its 
         * blocks were successfully created
         */
        initialized: false,
        
        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            this.rotationStates = this.rotationShapes.length;
            this.initBlocks();
            this.initialized = true;
        },
        
        /**
         * Once a new piece is spawned, we also need to spawn all its
         * sub-elements, e. g. every single block in that piece
         */
        initBlocks: function() {
            var s = this.getCurrentShape();
            for (var row = 0; row < s.length; row++) {
                for (var col = 0; col < s[row].length; col++) {
                    if (s[row][col] === 1) {
                        var newBlock = ig.game.spawnEntity( EntityBlock,
                                                            this.pos.x + (ig.global.TILESIZE * col),
                                                            this.pos.y + (ig.global.TILESIZE * row));
                        newBlock.setColor( this.color );
                        this.blocks.push(newBlock);
                    }
                }
            }
        },                
                
        rotateRight: function() {
            var rotated = this._doRotateRight();
            if (rotated) {
                this.soundRotate.play();
            }
        },
                
        /**
         * Block rotation is interesting and works as follows:
         * The rotation is executed (but you cannot see it) and then it checks
         * if the blocks now overlap with the collision map. If so, just rotate
         * everything back. If not, leave it as it is.
         */
        _doRotateRight: function() {
            this.rotationState = mmod( this.rotationState + 1, this.rotationStates );
            var shape = this.getCurrentShape();
            this.adjustBlockPositions( shape );
            // rotate back if something went wrong
            if (this.blocksHaveCollision()) {
                this._doRotateLeft();
                return false;
            }
            return true;
        },
                
        rotateLeft: function() {
            var rotated = this._doRotateLeft();
            if (rotated) {
                this.soundRotate.play();
            }
        },
        /**
         * Same as above. Rotate the block and rotate back, if blocks have
         * collision.
         */
        _doRotateLeft: function() {
            this.rotationState = mmod( this.rotationState - 1, this.rotationStates );
            var shape = this.getCurrentShape();
            this.adjustBlockPositions( shape );
            // rotate back if something went wrong
            if (this.blocksHaveCollision()) {
                this._doRotateRight();
                return false;
            }
            return true;
        },
                
        moveLeft: function() {
            for (var i = 0; i < this.blocks.length; i++) {
                if (this.blocks[i].canMoveLeft() === false) {
                    return false;
                }
            }
            
            this.pos.x -= ig.global.TILESIZE;
            for (var i = 0; i < this.blocks.length; i++) {
                this.blocks[i].moveLeft();
            }
            return true;
        },
        moveRight: function() {
            for (var i = 0; i < this.blocks.length; i++) {
                if (this.blocks[i].canMoveRight() === false) {
                    return false;
                }
            }
            
            this.pos.x += ig.global.TILESIZE;
            for (var i = 0; i < this.blocks.length; i++) {
                this.blocks[i].moveRight();
            }
            return true;
        },
        moveDown: function() {
            for (var i = 0; i < this.blocks.length; i++) {
                if (this.blocks[i].canMoveDown() === false) {
                    return false;
                }
            }

            this.pos.y += ig.global.TILESIZE;
            for (var i = 0; i < this.blocks.length; i++) {
                this.blocks[i].moveDown();
            }
            return true;
        },
        canMoveDown: function() {
            for (var i = 0; i < this.blocks.length; i++) {
                if (this.blocks[i].canMoveDown() === false) {
                    return false;
                }
            }
            return true;
        },
                
        /**
         * A shape is first placed in the little preview window. Once the
         * currently moving block is locked in, we need to teleport the
         * preview block to the actual game area.
         */
        teleportPos: function( newPos ) {
            this.pos.x = newPos.x;
            this.pos.y = newPos.y;
            var shape = this.getCurrentShape();
            this.adjustBlockPositions(shape);
        },
      
        /**
         * It loops through all blocks in that shape and moves them
         * depending on how the shape looks. For us, it looks like we're
         * rotating a block, if the next shape is selected.
         * Basically, a rotation is nothing else than a series of different
         * shapes.
         */
        adjustBlockPositions: function( shape ) {
            var entityIndex = 0;
            for (var row = 0; row < shape.length; row++) {
                for (var col = 0; col < shape[row].length; col++) {
                    if (shape[row][col] === 1) {
                        var block = this.blocks[entityIndex];
                        block.pos.x = this.pos.x + (ig.global.TILESIZE * col);
                        block.pos.y = this.pos.y + (ig.global.TILESIZE * row);
                        entityIndex++;
                    }
                }
            }
        },

        /**
         * If any of the blocks in that shape collide with the collision map,
         * return false and rotate back.
         */
        blocksHaveCollision: function() {
            for (var i = 0; i < this.blocks.length; i++) {
                if (this.blocks[i].overlapsCollisionMap()) {
                    return true;
                }
            }
            return false;
        },
              
        getCurrentShape: function() {
            return this.rotationShapes[this.rotationState];
        },
                
        lock: function() {
            this.initialized = false;
            for (var i = 0; i < this.blocks.length; i++) {
                this.blocks[i].lock();
            }
            return this.blocks;
        },
                
        isInitialized: function() {
            return this.initialized;
        }
    });
});