import { Component, Entity, Engine } from "@nova-engine/ecs";
import { DynamicBody, PhysicsBodyPlaceholder } from "./PhysicsSystem";

import { nosync } from "colyseus";

//const NodePhysijs = require('../nodejs-physijs');
//const THREE = NodePhysijs.THREE;
import * as THREE from  "three"


import * as nanoid from 'nanoid'

import { FPSCtrl } from '../../common/FPSCtrl'
import { ComponentUpdateSystem } from "./ComponentUpdateSystem";

import { MessageTypes, PlayerAnimationStateMessage } from "../../common/types";
import { SteeringBodyPlaceholder } from "./SteeringBehaviourSystem";
import { EventEmitter } from "events";
import { AttackComponent } from "./DamageComponents";



/**
 * eg . ContainerRoom
   this.addListener(MessageTypes.serverEvent, (player, data) => {

      const events = player.getComponent(ServerEvents)
      events.emit(data)

    })

 */




export
    class GenericBody implements Component {
    static readonly tag = "core/GenericBody";
    position: THREE.Vector3 = new THREE.Vector3
    rotation:THREE.Euler = new THREE.Euler //{ x: 0, y: 0, z: 0, order: "XYZ" }
    dimensions:THREE.Box3 = new THREE.Box3(new THREE.Vector3(-.5,0.-.5),new THREE.Vector3(.5,1,.5))
    velocity:THREE.Vector3 = new THREE.Vector3
}


export
    class LastPlayerCommand implements Component {
    static readonly tag = "core/LastPlayerCommand";
    command: string = "" //MessageTypes.playerDance
}



export
    class AnimationState implements Component, Updateable {
    static readonly tag = "core/AnimationState";
    state: string = PlayerAnimationStateMessage.idle

    update(mEntity: SerializableEntity): void {


        if (mEntity.hasComponent(HealthComponent))
        {
            const c = mEntity.getComponent(HealthComponent)
            if (!c.isAlive)
            {
                this.state=PlayerAnimationStateMessage.dying
                return
            }

        } 

        const command = mEntity.getComponent(LastPlayerCommand).command as MessageTypes


        if (command == MessageTypes.playerRotate) return // TODO enable rotate and dance as long as only camera is rotating

        if (command == MessageTypes.playerDance) {
            this.state = PlayerAnimationStateMessage.dance
        }
        else if (mEntity.hasComponent(JumpComponent) && mEntity.getComponent(JumpComponent).airborne) {

            this.state = PlayerAnimationStateMessage.jump

        }
        else if (mEntity.hasComponent(ControllerComponent)) {
            const playerController = mEntity.getComponent(ControllerComponent)

            const p = playerController.velocity / playerController.maxSpeed
            if (p > 0.5)
                this.state = PlayerAnimationStateMessage.run
            else if (p > 0.1)
                this.state = PlayerAnimationStateMessage.walk
            else if (p <= 0.1)
                this.state = PlayerAnimationStateMessage.idle

            // if idle && pose/special => dance
            // if speed && ducking => crouch or crouch-idle


        }


    }



}


// TODO
export
    class TemplateComponent implements Component {
    static readonly tag = "core/TemplateComponent";

    data: string = "<a-sphere></a-box>";

}


// TODO
export
    class AssetsComponent implements Component {
    static readonly tag = "core/TemplateComponent";


    id = "bunny"
    src: string = "/assets/bunny.glb";

}


export
    class BaseEngine extends Engine {
    static readonly tag = "core/Room";

    constructor(public boundingBox: THREE.Box3) {
        super()



        const componentUpdater = new ComponentUpdateSystem();

        this.addSystem(componentUpdater)

    }


    addEntity(entity) {
        entity.engine = this
        return super.addEntity(entity)
    }

}



export
    class Inventory implements Component {
    static readonly tag = "core/Inventory";
    items: Item[] = [];

}



export
    class SerializableEntity extends Entity {

    // reference to the containing ecs engine/room 
    @nosync
    engine: BaseEngine;

    @nosync 
    events:EventEmitter = new EventEmitter();

    eventnames:string[]=[]

    @nosync
    serializable=["id","name","eventnames"]
    
    name: string;
    constructor(id?: string) {
        super()
        this.id = id || nanoid();
        this.name = this.constructor.name
    }


    toJSON() {
        const res = { name: this.name, id: this.id }

        this.listComponents().forEach(c => res[c.constructor.name] = c)

        this.serializable.forEach(prop=>{
            // @ts-ignore
            res[prop] =this[prop];
          }) 

        return res

    }

    on(event: string , listener: (...args: any[]) => void): this
    {
      if (this.eventnames.indexOf(event)<0)
        this.eventnames.push(event)


        this.events.on(event,listener)
        return this
    }

    off(event: string , listener: (...args: any[]) => void): this
    {
        this.events.off(event,listener)
        return this
    }


    emit(event: string , ...args: any[]): boolean
    {
        if (this.eventnames.indexOf(event)<0)
        console.warn("Entity",this.name,"has no registered event:",event)

       return this.events.emit(event,...args)  
    }




    distanceTo(otherEntity: Entity) {
        let mProp = this.getComponent(GenericBody)
        let oProp = otherEntity.getComponent(GenericBody)

        if (!mProp || !oProp) return Infinity // as no position, distance can't be evaluated

        return mProp.position.distanceTo(oProp.position)

    }

}




export
    class Player extends SerializableEntity {

    constructor(id: string) {
        super(id)
        this.putComponent(LastPlayerCommand)
        this.putComponent(GenericBody)

        this.putComponent(HealthComponent)

        this.putComponent(ProximityComponent)

        this.putComponent(Inventory)
        this.putComponent(DynamicBody)

        this.putComponent(PhysicsBodyPlaceholder)

        this.putComponent(JumpComponent)
        this.putComponent(ControllerComponent)

        this.putComponent(InteractControllerComponent)
        this.putComponent(AnimationState)


     
        this.on("hello-event",(...args)=>{

                console.log("hello-event",...args)
                //TODO  
                /* 
                this.getComponent(FOVComponent)
                
                
                
                */
        })


    }




}


export
    class NPC extends SerializableEntity {

    constructor() {
        super()
        // this.putComponent(GenericBody)
        this.putComponent(Inventory)
        this.putComponent(DynamicBody)

        
        this.putComponent(PhysicsBodyPlaceholder)

    }
}


export
    class NPCSteering extends SerializableEntity {

    constructor() {
        super()
        
        this.putComponent(Inventory)
       // this.putComponent(GenericBody).position.y=1.5
        this.putComponent(DynamicBody).linearFactor=new THREE.Vector3(1, 1, 1)        
        
        this.putComponent(SteeringBodyPlaceholder)

        
        //this.putComponent(TemplateComponent).data = `<a-sphere color="blue" scale=".5 .5 .5" src="/assets/crate1.jpg"></a-sphere>`;
        this.putComponent(AssetsComponent)



        this.putComponent(ProximityComponent).maxDistance=2
        this.putComponent(AttackComponent)


    }
}


export
    class Item extends SerializableEntity {

    title: string = "Item"
    description: string = "Item is an item."
    amount:number=1

    constructor() {
        super()
        this.serializable.push("title","description","amount")
        this.putComponent(TemplateComponent).data = `<a-box src="/assets/crate1.jpg"></a-box>`;
        this.putComponent(DynamicBody)
        this.putComponent(PhysicsBodyPlaceholder)


    }
}



export
    class Medipac extends Item {

    title: string = "Medipac"
    description: string = "A standard Medipac restoring 10 HP."
    amount:number=1

    constructor() {
        super()
       
        this.on("consume",()=>{

                console.log("TODO consume medipac")


        })


    }
}




// TODO alternatively have a ExplodeComponent? which is more flexible and can be placed on anything
export
    class Bomb extends SerializableEntity {

    title: string = "ActiveBomb"

    timer = 3

    constructor() {
        super()

        this.putComponent(TemplateComponent).data = `
        <a-entity>
        <a-sphere radius="0.5" src="/assets/crate1.jpg"></a-sphere>
        <a-text value="{{timer}}" align="center" color="#6a5acd" font="/assets/fonts/Federation TNG Title.fnt" negate="false" position="0 1 0"></a-text>
        </a-entity>
        `;
        this.putComponent(GenericBody)
        this.putComponent(DynamicBody)
        this.putComponent(PhysicsBodyPlaceholder)

        this.putComponent(ProximityComponent)



        setTimeout(() => {

            let entries = this.getComponent(ProximityComponent).entries

            entries = entries.sort((a, b) => a.distance - b.distance).filter(v => v.entity instanceof Item)

            if (entries.length == 0) return

            /*  const closest = entries[0]
              if (closest && closest.distance < 2) {
                  this.engine.removeEntity(closest.entity)
                  console.log("boom")
              }
  
            */
            
            entries.forEach(closest => {
                console.log(closest)
                if (closest.distance < 3) {
                    this.engine.removeEntity(closest.entity)
                    console.log("boom")
                }
            })


            this.engine.removeEntity(this)
        }, this.timer * 1000)




    }
}




/**
 * spawn points should be used to spawn players & players
 */
export
    class SpawnPoint extends SerializableEntity {

    @nosync
    script: FPSCtrl;

    current = 0;
    max = 20;

    constructor() {
        super()
        this.putComponent(GenericBody)
        this.putComponent(TemplateComponent).data = `<a-box scale="0.5 0.5 0.5" src="/assets/crate1.jpg"></a-box>`;
        this.script = new FPSCtrl(5).start()
        this.script.on('frame', () => this.update())

    }


    update() {

        this.current++;

        if (this.current > 20) return
        const block = new NPC()


        if (this.current > 17) {
            const item = new Medipac()
            this.engine.addEntity(item)
            return
        }


        const color = '#' + new THREE.Color(Math.random() * 255 * 255 * 255).getHex().toString(16)

        if (this.current % 5 != 0)
            block.putComponent(TemplateComponent).data = `<a-sphere radius=0.5 color="${color}"></a-sphere>`
        else
            block.putComponent(AssetsComponent)

        block.getComponent(DynamicBody).mass = 2

        this.engine.addEntity(block)

    }


}






interface FOVEntry {
    distance: number;
    entity: Entity;
}

export
interface Initable {

    init(mEntity: SerializableEntity): void;
}

export
    interface Updateable {
    update(mEntity: SerializableEntity): void;
}




class ProximityModel {
    @nosync
    entity: Entity;

    id: string | number;
    name: string;

    constructor(public distance: number, entity: Entity) {
        this.entity = entity

        this.id = entity.id

        // @ts-ignore
        this.name = entity.name

    }

}


export
    class HealthComponent implements Component,Updateable{
    update(mEntity: SerializableEntity): void {
      
        if (this.life.current<0)
        {
        this.life.current=0
        this.isAlive=false;
        }
    }
    isAlive=true;
    life={current:80,maximum:100}
    shield={current:80,maximum:100}
}

// TODO create character that may jump off of other objects 
export
    class JumpComponent implements Component, Initable {
    static readonly tag = "core/JumpComponent";

    @nosync
    mEntity: SerializableEntity;

    jump1 = false
    jump2 = false
    airborne = false

    init(mEntity: SerializableEntity) {

        this.mEntity = mEntity

        const mBody = this.mEntity.getComponent(DynamicBody)

        mBody.body.addEventListener('collision', (other_object, relative_velocity, relative_rotation, contact_normal) => {
            if (contact_normal.y < -0.5) {
                this.jump1 = false;
                this.jump2 = false;
                this.airborne = false;
                if (relative_velocity.y < -4) {
                    var damage = Math.abs(relative_velocity.y + 10) * 3;
                    console.log("damage taken", damage)

                    const healthcomponent = this.mEntity.getComponent(HealthComponent)
                    healthcomponent.life.current-=4
                  


                    //takeDamage(damage);
                }
            }
        });

    }


    jump() {

        const mBody = this.mEntity.getComponent(DynamicBody)

        const force = new THREE.Vector3(0, 6, 0)
        var newForce = force.applyMatrix4(mBody.body.matrix);
        mBody.body.applyCentralImpulse(newForce);

        if (!this.jump1) {
            mBody.body.applyCentralImpulse(newForce);
            this.jump1 = true;
            // audioArray['jump'].play();
            this.airborne = true;
        }
        else if (!this.jump2) {
            mBody.body.applyCentralImpulse(newForce);
            this.jump2 = true;
            // audioArray['jump'].play();
        }
    }

}



export
    class ControllerComponent implements Component, Updateable {
    static readonly tag = "core/ControllerComponent";

    maxSpeed = 6; // units per second

    direction = new THREE.Vector3()
    velocity = 0


    restrict2D = false
    airWalk = true
    update(mEntity: SerializableEntity) {


        // enable/disable moving while jumping
        if (!this.airWalk)
            if (mEntity.hasComponent(JumpComponent)) {
                const c = mEntity.getComponent(JumpComponent)
                if (c.airborne) return //prevent change of direction if not on the ground
            }

        if (mEntity.hasComponent(DynamicBody)) {
            this.moveCurrentDirection(mEntity)
        }
        else if (mEntity.hasComponent(GenericBody)) {
            const position = mEntity.getComponent(GenericBody).position
            var velocityVector = (this.direction).normalize().multiplyScalar(this.maxSpeed - this.velocity);
            position.copy(velocityVector)
        }

    }

    moveCurrentDirection(mEntity: SerializableEntity) {
        var box = mEntity.getComponent(DynamicBody).body//this.component.entity.get('mesh').object;

        // FIXME either diret position or setting velocity should create decent movement
        if (this.restrict2D)
            box.setLinearFactor(new THREE.Vector3(1, 1, 0))
        else
            box.setLinearFactor(new THREE.Vector3(1, 1, 1))


        const lenV = box.getLinearVelocity()
        this.velocity = lenV.length();
        if (this.velocity < this.maxSpeed) {
            //  var matrix = (new THREE.Matrix4()).makeRotationFromEuler( box.rotation ); 
            //  var velocityVector = (new THREE.Vector3( 0, 0, -1 ).applyMatrix4(matrix)).normalize().multiplyScalar(this.maxSpeed-this.velocity);
            var velocityVector = (this.direction).normalize().multiplyScalar(this.maxSpeed - this.velocity);

            const newVelocity = box.getLinearVelocity().add(velocityVector)

            if (this.restrict2D)
                newVelocity.z = 0

            box.setLinearVelocity(newVelocity);




        }
    }

}





// pick up closest item and put into player inventory
export
    class InteractControllerComponent implements Component, Updateable {
    static readonly tag = "core/InteractControllerComponent";

    // creating and placing a bomb should not be handled with the interactcomponent
    interact(entity: SerializableEntity) {
        console.log("interact TODO currently used as attack  ")

     
        const playerPosition=entity.getComponent(GenericBody).position


    
        const bomb = new Bomb()

        bomb.getComponent(GenericBody).position.copy(playerPosition)

    

        
        entity.engine.addEntity(bomb)

    }


    update(mEntity: SerializableEntity) {
        let entries = mEntity.getComponent(ProximityComponent).entries

        entries = entries.sort((a, b) => a.distance - b.distance).filter(v => v.entity instanceof Item)

        if (entries.length == 0) return

        const closest = entries[0]
        if (closest && closest.distance < 2) {
            const inventory = mEntity.getComponent(Inventory)

            mEntity.engine.removeEntity(closest.entity)

            inventory.items.push(closest.entity as Item)

            console.log("Picked up Item")

        }
    }
}


export
    class RaycastComponent implements Component, Updateable {
    static readonly tag = "core/RayTraceComponent";

    update(mEntity: SerializableEntity) {

        // retrieve direction of ray from wasd controller
        const direction = mEntity.getComponent(ControllerComponent).direction
        // TODO use FOVComponent
        const entries = mEntity.getComponent(ProximityComponent).entries


        // retrieve objects for the raycaster (initially the physics objects will be sufficient)
        entries.map(v => v.entity.getComponent(GenericBody))


        /*
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera( mouse, camera );
        raycaster.setFromMatrix(...)
        var intersects = raycaster.intersectObjects( scene.children );
         */
    }

}

export
    class ProximityComponent implements Component, Updateable {
    static readonly tag = "core/ProximityComponent";

    maxDistance = Infinity;

    entries: FOVEntry[] = []

    update(mEntity: SerializableEntity) {
        this.entries = []
        for (let otherEntity of mEntity.engine.entities) {
            if (otherEntity == mEntity) continue;

            const distance = mEntity.distanceTo(otherEntity)

            if (distance < this.maxDistance)
                this.entries.push(new ProximityModel(distance, otherEntity))
        }
    }
}

// TODO iterate components of entity and forward entity attribute to be able to handle certain effects on component level
export
    class FOVComponent implements Component, Updateable {
    static readonly tag = "core/FOVComponent";

    maxDistance;

    entries: FOVEntry[] = []

    update(mEntity: SerializableEntity) {

        // TODO camera component? or calculate from basePorperties3d?
        let camera = new THREE.PerspectiveCamera()
        camera.updateMatrix();
        camera.updateMatrixWorld(false);
        var frustum = new THREE.Frustum();
        frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));


        let props = mEntity.getComponent(GenericBody)

        camera.position.copy(props.position)
        camera.rotation.copy(props.rotation)


        //get ProximityComponent and its elements
        const proximity = mEntity.hasComponent(ProximityComponent) ? mEntity.getComponent(ProximityComponent) : mEntity.putComponent(ProximityComponent)

        //find elements within Field of view 
        for (let other of proximity.entries) {
            let oProps = other.entity.getComponent(GenericBody)
            // Your 3d point to check
            if (frustum.containsPoint(oProps.position)) {

                //  const distance = mEntity.distanceTo(other.entity)
                // if (distance < this.maxDistance)
                this.entries.push({ distance: other.distance, entity: other.entity })
                // }


            }



        }

    }
}
// TODO RayTraceComponent use raytracer from threejs to find elements in front
// ProximityComponent find ellements that are in proximity
// use proximityComponent



