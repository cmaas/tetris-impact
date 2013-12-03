ig.module( 
	'game.entities.block-shape-triangle'
)
.requires(
	'game.entities.block',
    'game.entities.block-container'
)
.defines(function() {

    EntityBlockShapeTriangle = EntityBlockContainer.extend({
    
        color: EntityBlock.color.COLOR_TRIANGLE,    
        
        rotationShapes: [
            [[0,0,0],
             [1,1,1],
             [0,1,0]],
            [[0,1,0],
             [1,1,0],
             [0,1,0]],
            [[0,1,0],
             [1,1,1],
             [0,0,0]],
            [[0,1,0],
             [0,1,1],
             [0,1,0]]
        ]
    });
    
});