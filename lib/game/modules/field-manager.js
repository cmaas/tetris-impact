/**
 * The FieldManager handles stuff on a lower level than the RoundManager.
 * It locks, checks for full rows and clears them if necessary
 */
ig.module( 
	'game.modules.field-manager'
)
.requires(
    'game.entities.block',
    'game.entities.block-container'
)
.defines(function() {

    FieldManager = ig.Class.extend({
        
        /**
         * Keeps track of the actual playing area (without borders!)
         */
        field: [],
        
        init: function() {
            this.initField();
        },
                
        initField: function() {
            this.field = [];
            for (var row = 0; row < ig.global.FIELD_ROWS; row++) {
                var colArray = [];
                for (var col = 0; col < ig.global.FIELD_COLS; col++) {
                    colArray.push(null);
                }
                this.field.push(colArray);
            }
        },
                
        lockBlock: function( entity ) {
            var lockedBlocks = entity.lock();
            entity.kill();
            for (var i = 0; i < lockedBlocks.length; i++) {
                /* Note: getCurrentTile() returns the absolute tile in the collision map.
                 * There's an X offset of 1 tile, because we have a 1-tile wide border
                 * on the left. But there's no Y offset, because the playing area starts
                 * at the very top of the game screen. Thus, we have to do x-1 but keep y
                 * as is. 
                 */
                var lockTile = lockedBlocks[i].getCurrentTile();
                this.field[lockTile.y][lockTile.x-1] = lockedBlocks[i];
            }
        },
                
        handleLineCleaning: function() {
            var fullRows = this.checkFullLines();
            return this.cleanFullRows(fullRows);
        },
          
        /**
         * Checks for lines that are full and returns them
         */
        checkFullLines: function() {
            var fullRows = [];
            for (var row = 0; row < ig.global.FIELD_ROWS; row++) {
                var columnCount = 0;
                for (var col = 0; col < ig.global.FIELD_COLS; col++) {
                    if (this.field[row][col] === null) {
                        break;
                    }
                    columnCount++;
                }
                // row is full, if all columns are filled with entities
                if (columnCount === ig.global.FIELD_COLS) {
                    fullRows.push(row);
                }
            }
            
            return fullRows;
        },
            
        /**
         * Removes all full rows and moves rows down that are higher than the
         * cleaned row. Note that this is not the most effective algorithm,
         * because it cycles through all rows and moves them down one by one.
         * Please see the tutorial for more information on the way this is
         * resolved.
         */
        cleanFullRows: function( fullRowNumbers ) {
            var fullRowCount = fullRowNumbers.length;
            if (fullRowCount <= 0) {
                return 0;
            }
            fullRowNumbers.sort(function(a,b){return a-b});
            for (var i = 0; i < fullRowNumbers.length; i++) {
                var row = fullRowNumbers[i];
                for (var col = 0; col < ig.global.FIELD_COLS; col++) {
                    var singleBlock = this.field[row][col];
                    singleBlock.freeCollisionMap();
                    singleBlock.kill();
                    this.field[row][col] = null;                    
                }
                // ineffective, cycles through many rows multiple times (max 4 times)
                // could be improved if the distances between empty rows were calculated
                this.moveUpperRowsDown( row, 1 );                
            }
            return fullRowCount;
        },
                
        moveUpperRowsDown: function ( untilRow, distanceRows ) {
            for (var row = untilRow; row >= 0; row--) {
                for (var col = 0; col < ig.global.FIELD_COLS; col++) {
                    var singleBlock = this.field[row][col];
                    if (singleBlock === null) {
                        continue;
                    }
                    singleBlock.freeCollisionMap();
                    for (var i = 0; i < distanceRows; i++) {
                        singleBlock.moveDown();
                    }
                    singleBlock.lock();
                    this.field[row][col] = null;
                    this.field[row+distanceRows][col] = singleBlock;
                }
            }
        },
             
        /**
         * Makes all blocks in a row enter the destruction (blinking) state
         */
        startLineDestruction: function( lines) {
            for (var i = 0; i < lines.length; i++) {
                var row = lines[i];
                for (var col = 0; col < ig.global.FIELD_COLS; col++) {
                    var singleBlock = this.field[row][col];
                    if (singleBlock !== null) {
                        singleBlock.startDestruction();
                    }
                }
            }
        },
             
        /**
         * Outputs the field in the console, for debugging only.
         */
        logField: function() {
            for (var row = 0; row < ig.global.FIELD_ROWS; row++) {
                var s = "";
                for (var col = 0; col < ig.global.FIELD_COLS; col++) {
                    s += (this.field[row][col] !== null ? '1' : 0);
                }
                ig.log(row + ": " + s);
            }
        }
    });
});