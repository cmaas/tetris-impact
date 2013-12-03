ig.module( 
	'game.entities.block-shape-line'
)
.requires(
	'game.entities.block',
    'game.entities.block-container'
)
.defines(function() {

    EntityBlockShapeLine = EntityBlockContainer.extend({
        
        color: EntityBlock.color.COLOR_LINE,
        
        // add some zeros to make the rotation center clear
        rotationShapes: [
            [[0,0,0,0],
             [0,0,0,0],
             [1,1,1,1]],
            [[0,1,0],
             [0,1,0],
             [0,1,0],
             [0,1,0]]         
        ]
    });
});