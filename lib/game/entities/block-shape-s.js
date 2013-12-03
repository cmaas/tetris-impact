ig.module( 
	'game.entities.block-shape-s'
)
.requires(
	'game.entities.block',
    'game.entities.block-container'
)
.defines(function() {

    EntityBlockShapeS = EntityBlockContainer.extend({
    
        color: EntityBlock.color.COLOR_S,    
        
        rotationShapes: [
            [[0,1,1],
             [1,1,0]],
            [[1,0],
             [1,1],
             [0,1]]
        ]
    });
});