ig.module( 
	'game.entities.block-shape-square'
)
.requires(
	'game.entities.block',
    'game.entities.block-container'
)
.defines(function() {

    EntityBlockShapeSquare = EntityBlockContainer.extend({
    
        color: EntityBlock.color.COLOR_SQUARE,    
        
        rotationShapes: [
            [[1,1],
             [1,1]]
        ]
    });
});