import { BaseEngine, SpawnPoint, GenericBody, NPCSteering } from "./TestComponents";
import { PhysicsSystem } from "./PhysicsSystem";
import { SteeringBehaviourSystem } from "./SteeringBehaviourSystem";

export function
    physicsJumpDemo(engine: BaseEngine) {


    const physics = new PhysicsSystem();
    engine.addSystem(physics)

    const spawnPoint = new SpawnPoint()

    spawnPoint.getComponent(GenericBody).position.y = engine.boundingBox.max.y

    spawnPoint.max = 5
    engine.addEntity(spawnPoint)




}

export function
    physicsSteeringDemo(engine: BaseEngine) {


    const physics = new PhysicsSystem();
    engine.addSystem(physics)

    const steering = new SteeringBehaviourSystem();
    engine.addSystem(steering)


    const spawnPoint = new SpawnPoint()

    spawnPoint.getComponent(GenericBody).position.y = engine.boundingBox.max.y

    spawnPoint.max = 20
    engine.addEntity(spawnPoint)


    const test = new NPCSteering()
    engine.addEntity(test)
    engine.addEntity(new NPCSteering())
    engine.addEntity(new NPCSteering())
    engine.addEntity(new NPCSteering())
    engine.addEntity(new NPCSteering())
    // test.getComponent(SteeringBody).mode=SteeringActions.wander




}


export function staticDemo(engine: BaseEngine) {


    const spawnPoint = new SpawnPoint()

    spawnPoint.getComponent(GenericBody).position.y = 1

    spawnPoint.max = 20
    this.addEntity(spawnPoint)



}