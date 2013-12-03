ig.module(
    'plugins.gridmovement'
)
.requires(
    'impact.impact'
)
.defines(function() {
    GridMovement = ig.Class.extend({
        entity: null,

        init:function(entity) {
            this.entity = entity;
        },

        /*update: function() {
            var tile = this.getCurrentTile();
            this.snapToTile(Math.floor(tile.x), Math.floor(tile.y));
        },*/

        move: function( direction ) {
            if (this.canMove( direction )) {
                var currentTile = this.getCurrentTile();
                var targetTile = this.getAdjacentTile( currentTile.x, currentTile.y, direction );
                var newPos = this.tileToPixelPos( targetTile.x, targetTile.y );
                this.entity.pos.x = newPos.x;
                this.entity.pos.y = newPos.y;
            }
        },

        getCurrentTile: function() {
            var tilesize = ig.game.collisionMap.tilesize;
            var tileX = this.entity.pos.x / tilesize;
            var tileY = this.entity.pos.y / tilesize;
            return { x: tileX, y: tileY };
        },
                
        getAdjacentTile: function(tileX, tileY, direction) {
            if (direction === GridMovement.direction.UP) tileY += -1;
            else if (direction === GridMovement.direction.DOWN) tileY += 1;
            else if (direction === GridMovement.direction.LEFT) tileX += -1;
            else if (direction === GridMovement.direction.RIGHT) tileX += 1;
            return { x:tileX, y:tileY };
        },
                
        snapToTile:function (x, y) {
            var tilesize = ig.game.collisionMap.tilesize;
            this.entity.pos.x = x * tilesize;
            this.entity.pos.y = y * tilesize;
        },
                
        canMoveFromTile: function (tileX, tileY, direction) {
            var newPos = this.getAdjacentTile(tileX, tileY, direction);
            return ig.game.collisionMap.data[Math.round(newPos.y)][Math.round(newPos.x)] === 0;
        },

        canMove: function (direction) {
            var currTile = this.getCurrentTile();
            return this.canMoveFromTile(currTile.x, currTile.y, direction);
        },
                
        tileToPixelPos: function ( tileX, tileY ) {
            return { x: tileX * ig.game.collisionMap.tilesize, y: tileY * ig.game.collisionMap.tilesize };
        }
    });

    GridMovement.direction = {
        'UP': 1,
        'DOWN': 2,
        'LEFT': 4,
        'RIGHT': 8
    };
});        