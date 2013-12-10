ig.module( 
	'game.entities.block-shape-single'
)
.requires(
	'game.entities.block',
    'game.entities.block-container'
)
.defines(function() {

    EntityBlockShapeSingle = EntityBlockContainer.extend({
    
        rotationShapes: [
            [[1]]
        ]
    });
});
