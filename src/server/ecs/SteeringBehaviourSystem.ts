
import * as THREE from  "three"
import { SteeringEntity } from './three-steer'




import { Engine, Family, System, FamilyBuilder, Component } from "@nova-engine/ecs";
import { BaseEngine, GenericBody, Updateable, SerializableEntity, Initable } from "./TestComponents";
import { nosync } from "colyseus";
import { FPSCtrl } from "../../common/FPSCtrl";
import { DynamicBody } from './PhysicsSystem';





export 
enum SteeringActions {
    none, seek, flee, arrive, pursue, evade, interpose, wander,
    /*
    Collision Avoidance
    Follow Path
    Follow Leader
    Queue
    Cohesion, separation and alignment (Flocking)
    */

}
export
class SteeringBodyPlaceholder implements Component
{}

export
    class SteeringBody implements Component {


    static readonly tag = "core/SteeringBody";
    mode: SteeringActions = SteeringActions.none
    lookWhereGoing: boolean = true


        body:THREE.Object3D

    // inside of system loop
    /*   update(mEntity: SerializableEntity): void {
   
           // if !physics => copy this.body => 
   
   
        }*/

    /*    init(mEntity: SerializableEntity): void {

            mEntity.engine.addSystem
            throw new Error("Method not implemented.");
        }
*/
}

export
    class NPCBehaviour implements Component, Updateable {
    static readonly tag = "core/NPCBehaviour";
    update(mEntity: SerializableEntity): void {

        // if enemy in proximity or fov => move closer or move away
        // if in attack distance => attack
        // else wander or follow_path


    }

}








export
    class SteeringBehaviourSystem extends System {

    family?: Family;
    notInitializedEntities?: Family;


    world;



    // Constructors are free for your own implementation
    constructor() {
        super();
        // higher priorities means the system runs before others with lower priority
        this.priority = 300;

    }
    // This is called when a system is added to an engine, you may want to
    // startup your families here.
    onAttach(engine: BaseEngine) {

        // Needed to work properly
        super.onAttach(engine);


         
         this.world = new THREE.Scene(); //new Physijs.Scene();
        /* const script = new FPSCtrl(30).start()
         script.on("frame", () => {
             this.world.simulate(undefined, 1)
         })
         */


        // Families are an easy way to have groups of entities with some criteria.
        this.family = new FamilyBuilder(engine).include(DynamicBody,SteeringBodyPlaceholder, SteeringBody).build();

        this.notInitializedEntities = new FamilyBuilder(engine).include(DynamicBody,SteeringBodyPlaceholder).exclude(SteeringBody).build();





    }

    // TODO addEntity(entity:GenericBody,bb:BoundingBox, props: DynamicBody)
    addWorldEntity(position, dimensions = [1, 1, 1], mass?: number) {

       const  params = { maxSpeed: .05, maxForce: .5, lookAtDirection: true, wanderDistance: 3, wanderRadius: 5, wanderRange: 1, numEntities: 20, radius: 2, avoidDistance: 4 }
        //Plane boundaries (do not cross)
        const boundaries = new THREE.Box3(new THREE.Vector3(-50, -50, -50), new THREE.Vector3(50, 50, 50));


        const geometry = new THREE.BoxGeometry( 1, 5, 2 );
        const material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, wireframe: true } );
        const mesh = new THREE.Mesh(geometry, material);

 
        const entity = new SteeringEntity(mesh);


        entity.maxSpeed = params.maxSpeed;
       entity.maxForce = params.maxForce;
       entity.wanderDistance = params.wanderDistance;
       entity.wanderRadius = params.wanderRadius;
       entity.wanderRange = params.wanderRange;
       entity.avoidDistance = params.avoidDistance;
       entity.radius = params.radius;
     

        //  entity.followPath(path, entity.loop, entity.thresholdRadius);


        /* 
         queued[i].avoid(queued)
         queued[i].queue(queued, params.maxQueueRadius)
        if(queued[i].position.distanceTo(entity1.position)<=100)   
        scene.remove(queued[i])
        arrived.push(queued[i])
        */
       //entity.avoid(entities)
        if (params.lookAtDirection)
           entity.lookWhereGoing(true);
        else
           entity.rotation.set(0, 0, 0)
       entity.update()
       entity.bounce(boundaries)


        this.world.add(entity);


        return entity
    }

    update(engine: Engine, delta: number) {

        for (let entity of this.family.entities) {

            const genericBody = entity.getComponent(GenericBody)
            const position = genericBody.position;
            const rotation =genericBody.rotation;
            const steeringBody = entity.getComponent(SteeringBody);
       
            const body: any =steeringBody.body
           
            const boundaries = new THREE.Box3(new THREE.Vector3(-5, -5, -5), new THREE.Vector3(5, 5, 5));

            body.wander()
            body.avoid(engine.entities.filter(v => v.hasComponent(SteeringBody)).map(v=>v.getComponent(SteeringBody).body))
            body.bounce(boundaries)
            body.update()


        }

        for (let entity of this.notInitializedEntities.entities) {

            const steeringBody = entity.putComponent(SteeringBody);
            const dynamicBody = entity.getComponent(DynamicBody)
            // You can create components on an entity easily.

            if (!entity.hasComponent(GenericBody))
                entity.putComponent(GenericBody)


            const genericBody = entity.getComponent(GenericBody);
            genericBody.position.y = 1
            const steeringEntity = this.addWorldEntity(genericBody.position, [1, 1, 1], dynamicBody.mass)

            // will not work this way if we use another system like physics
            genericBody.position = steeringEntity.position
           // genericBody.rotation = steeringEntity.rotation

         /*   steeringEntity.setLinearFactor(dynamicBody.linearFactor)
            steeringEntity._entity = entity

            dynamicBody.body = steeringEntity;*/

            steeringBody.body=steeringEntity


        }
    }
}
