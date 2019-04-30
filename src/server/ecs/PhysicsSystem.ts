
const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;
const Ammo = NodePhysijs.Ammo;
const Physijs = NodePhysijs.Physijs(THREE, Ammo);



import { Engine, Family, System, FamilyBuilder, Component } from "@nova-engine/ecs";
import { VelocityComponent, PositionComponent, Room, BaseProperties3D } from "./TestComponents";
import { createDemo, roomPlanesFromBoundingBox, createBasicPhysicsMaterial } from "../rooms/physics/demo";

export
    class DynamicBody implements Component {
    static readonly tag = "core/DynamicBody";

    mass: number = 0;
    friction: number = 1;
    restitution: number = 0.1

}

export
    class PhysicsSystem extends System {
    static readonly DEFAULT_ACCELERATION = 0.98;
    family?: Family;
    notInitializedEntities?: Family;
    acceleration: number;

    world;



    // Constructors are free for your own implementation
    constructor(acceleration = PhysicsSystem.DEFAULT_ACCELERATION) {
        super();
        this.acceleration = acceleration;
        // higher priorities means the system runs before others with lower priority
        this.priority = 300;


    }
    // This is called when a system is added to an engine, you may want to
    // startup your families here.
    onAttach(engine: Room) {

        // Needed to work properly
        super.onAttach(engine);

        // this.world=createDemo(engine.boundingBox)
        this.world = new Physijs.Scene();
            
        
        // FIXME calling simulate in update loop will leak mem        
        let render;
            render = () => {
                this.world.simulate() // run physics
                setTimeout( render, 200 );
            };
            render()


        // TODO
        const boundingBox = new THREE.Box3(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 10, 5))
      //  roomPlanesFromBoundingBox(boundingBox).forEach(plane => this.world.add(plane))

        const ground = new Physijs.PlaneMesh(
            new THREE.PlaneGeometry(1e6, 1e6),
            createBasicPhysicsMaterial()
        );
        ground.rotation.x = -Math.PI / 2
        ground.position.y = 0;
        this.world.add(ground);



        // Families are an easy way to have groups of entities with some criteria.
        this.family = new FamilyBuilder(engine).include(DynamicBody,BaseProperties3D).build();

        this.notInitializedEntities = new FamilyBuilder(engine).include(DynamicBody).exclude(BaseProperties3D).build();





    }

// TODO addEntity(entity:BaseProperties3D,bb:BoundingBox, props: DynamicBody)
    addWorldEntity(position, dimensions = [1, 1, 1], mass?: number) {

        const material = createBasicPhysicsMaterial()

        const box_falling = new Physijs.BoxMesh(
            new THREE.CubeGeometry(...dimensions),
            material,
            mass
        );
        box_falling.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );



        box_falling.position.copy(position)
        this.world.add(box_falling);
        return box_falling
    }


    // This, in reality is the only method your system must implement
    // but using onAttach to prepare your families is useful.
    update(engine: Engine, delta: number) {

        for (let entity of this.family.entities) {

                const position = entity.getComponent(BaseProperties3D).position;
                
                if (entity==this.family.entities[0])
                console.log("physics first entry", position)
 
        }

        for (let entity of this.notInitializedEntities.entities) {
  
                // You can create components on an entity easily.
               const props= entity.putComponent(BaseProperties3D);
               props.position.y=5
              const physicsFU=  this.addWorldEntity(props.position,[1,1,1],1)
                props.position=physicsFU.position
                props.rotation=physicsFU.rotation

            
        }

        


      
      //  this.updateWorld()

    }
}
