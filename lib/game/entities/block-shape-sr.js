ig.module( 
	'game.entities.block-shape-sr'
)
.requires(
	'game.entities.block',
    'game.entities.block-container'
)
.defines(function() {

    EntityBlockShapeSR = EntityBlockContainer.extend({
    
        color: EntityBlock.color.COLOR_SR,    
        
        rotationShapes: [
            [[1,1,0],
             [0,1,1]],
            [[0,1],
             [1,1],
             [1,0]]
        ]
    });
});