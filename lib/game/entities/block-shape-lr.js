ig.module( 
	'game.entities.block-shape-lr'
)
.requires(
	'game.entities.block',
    'game.entities.block-container'
)
.defines(function() {

    EntityBlockShapeLR = EntityBlockContainer.extend({
    
        color: EntityBlock.color.COLOR_LR,
    
        rotationShapes: [
            [[0,0,0],
             [1,1,1],
             [0,0,1]],
            [[0,1,0],
             [0,1,0],
             [1,1,0]],
            [[1,0,0],
             [1,1,1],
             [0,0,0]],
            [[0,1,1],
             [0,1,0],
             [0,1,0]]
        ]
    });
});