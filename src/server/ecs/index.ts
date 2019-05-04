import { Engine, Entity } from "@nova-engine/ecs";
import { GravitySystem } from "./GravitySystem";
import { PhysicsSystem, DynamicBody } from "./PhysicsSystem";
import { PositionComponent, VelocityComponent, Room, NPC, Player } from "./TestComponents";
const engine = new Engine();


const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;


// Components can have custom constructors, but they must be able to be initialized
// with no arguments, because entities creates the instances for you.
// Try not to save complex data types in yout components

// If you are making a component library, and want to avoid collitions
// You can add a tag to your component implementations



//----------------------------------


//const gravity = new GravitySystem();
//engine.addSystem(gravity)





export
    function createRoom() {

        const physics = new PhysicsSystem();



     

        const boundingBox = new THREE.Box3(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 10, 5))
  
        const room = new Room(boundingBox)
    room.addSystem(physics)



    let i = 0
    setInterval(() => {
        i++;

        if (i > 20) return
        const block = new NPC()
        physics.addWorldEntity(block)
        room.addEntity(block)
    }, 200)


    return room

}









