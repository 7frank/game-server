
import { Engine,Family, System, FamilyBuilder,Component } from "@nova-engine/ecs";
import { VelocityComponent, PositionComponent } from "./TestComponents";





export 
class GravitySystem extends System {
    static readonly DEFAULT_ACCELERATION = 0.98;
    family?: Family;
    acceleration: number;

    // Constructors are free for your own implementation
    constructor(acceleration = GravitySystem.DEFAULT_ACCELERATION) {
        super();
        this.acceleration = acceleration;
        // higher priorities means the system runs before others with lower priority
        this.priority = 300;
    }
    // This is called when a system is added to an engine, you may want to
    // startup your families here.
    onAttach(engine: Engine) {
        // Needed to work properly
        super.onAttach(engine);
        // Families are an easy way to have groups of entities with some criteria.
        this.family = new FamilyBuilder(engine).include(VelocityComponent).build();
    }

    // This, in reality is the only method your system must implement
    // but using onAttach to prepare your families is useful.
    update(engine: Engine, delta: number) {
        for (let entity of this.family.entities) {
            // Easy to get a component by class
            // Be warned, if the entity lacks this component, an error *will* be thrown.
            // But families ensures than we will always have the required components.
            const velocity = entity.getComponent(VelocityComponent);
            velocity.y += this.acceleration;
            // if the family doesn't require that component
            // you can always check for it
            if (entity.hasComponent(PositionComponent)) {
                const position = entity.getComponent(PositionComponent);

                position.x += velocity.x
                position.y += velocity.y
                console.log(position)

            } else {
                // You can create components on an entity easily.
                const position = entity.putComponent(PositionComponent);
            }
        }
    }
}
