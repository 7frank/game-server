
const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;
const Ammo = NodePhysijs.Ammo;
const Physijs = NodePhysijs.Physijs(THREE, Ammo);



import { Engine, Family, System, FamilyBuilder, Component } from "@nova-engine/ecs";
import { VelocityComponent, PositionComponent, Room, BaseProperties3D } from "./TestComponents";






export 
function roomPlanesFromBoundingBox(boundingBox: THREE.Box3) {
    Object.values(boundingBox.min)
    Object.values(boundingBox.max)


    var material = createBasicPhysicsMaterial()
    const planeGeometry = new THREE.PlaneGeometry(1e6, 1e6)

    const planes = []


    const ground = new Physijs.PlaneMesh(
        planeGeometry,
        material
    );
    ground.rotation.x = -Math.PI / 2
    ground.position.y = boundingBox.min.y;

    const top = new Physijs.PlaneMesh(
        planeGeometry,
        material
    );
    top.rotation.x = Math.PI / 2
    top.position.y = boundingBox.max.y;


    const back = new Physijs.PlaneMesh(
        planeGeometry,
        material
    );
    //top.rotation.x = Math.PI / 2
    back.position.z = boundingBox.min.z;

    const front = new Physijs.PlaneMesh(
        planeGeometry,
        material
    );
    front.rotation.y = Math.PI
    front.position.z = boundingBox.max.z;


    const left = new Physijs.PlaneMesh(
        planeGeometry,
        material
    );
    left.rotation.y = Math.PI / 2
    left.position.x = boundingBox.min.x;

    const right = new Physijs.PlaneMesh(
        planeGeometry,
        material
    );
    right.rotation.y = -Math.PI / 2
    right.position.x = boundingBox.max.x;






    planes.push(ground, top, front, back, left, right)


    return planes
}

export 
function createBasicPhysicsMaterial() {

    var friction = 0.8; // high friction
    var restitution = 0.3; // low restitution

    var material = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ color: 0x888888 }),
        friction,
        restitution
    );
    return material

}


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
                setTimeout( render, 20 );
            };
            render()


        // FIXME no longer working  all the time
        const boundingBox = new THREE.Box3(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 10, 5))
        roomPlanesFromBoundingBox(boundingBox).forEach(plane => this.world.add(plane))


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
       /* box_falling.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
*/


        box_falling.position.copy(position)
        this.world.add(box_falling);
        return box_falling
    }


    // This, in reality is the only method your system must implement
    // but using onAttach to prepare your families is useful.
    update(engine: Engine, delta: number) {

        for (let entity of this.family.entities) {

                const position = entity.getComponent(BaseProperties3D).position;
                const rotation = entity.getComponent(BaseProperties3D).rotation;
                
                if (entity==this.family.entities[0])
                console.log("physics first entry", rotation)
 
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
