import { Component, Entity, Engine } from "@nova-engine/ecs";
import { DynamicBody } from "./PhysicsSystem";

const NodePhysijs = require('../nodejs-physijs');
const THREE = NodePhysijs.THREE;

import * as nanoid from 'nanoid'
import { Vector3, BooleanKeyframeTrack } from "three";


export
    class BaseProperties3D implements Component {
    static readonly tag = "core/BaseProperties3D";
    position: THREE.Vector3 = new THREE.Vector3
    rotation = { x: 0, y: 0, z: 0, order: "XYZ" }
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


    id = "pinetree"
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
    items: Item[]=[];

}

export
    class SerializableEntity extends Entity {

    // reference to the containing ecs engine/room 
    engine: BaseEngine;
    name: string;
    constructor(id?: string) {
        super()
        this.id = id || nanoid();
        this.name = this.constructor.name
    }


    toJSON() {
        const res = { name: this.name, id: this.id }

        this.listComponents().forEach(c => res[c.constructor.name] = c)


        return res

    }

    distanceTo(otherEntity: Entity) {
        let mProp = this.getComponent(BaseProperties3D)
        let oProp = otherEntity.getComponent(BaseProperties3D)

        if (!mProp || !oProp) return Infinity // as no position, distance can't be evaluated

        return mProp.position.distanceTo(oProp.position)

    }

}




export
    class Player extends SerializableEntity {

    constructor(id: string) {
        super(id)
        this.putComponent(BaseProperties3D)
        this.putComponent(ProximityComponent)

        this.putComponent(Inventory)
        this.putComponent(DynamicBody)
        this.putComponent(JumpComponent)
        this.putComponent(ControllerComponent)

        this.putComponent(InteractControllerComponent)


    }




}


export
    class NPC extends SerializableEntity {

    constructor() {
        super()
        // this.putComponent(BaseProperties3D)
        this.putComponent(Inventory)
        this.putComponent(DynamicBody)

    }




}


export
    class Item extends SerializableEntity {

    title: string = "Item"
    description: string = "Item is an item."

    constructor() {
        super()

        this.putComponent(TemplateComponent).data = `<a-box src="/assets/crate1.jpg"></a-box>`;
        this.putComponent(DynamicBody)



    }
}




/**
 * spawn points should be used to spawn players & players
 */
export
    class SpawnPoint extends SerializableEntity {

    script: FPSCtrl;

    current = 0;
    max = 20;

    constructor() {
        super()
        this.putComponent(BaseProperties3D)
        this.putComponent(TemplateComponent).data = `<a-box scale="0.5 0.5 0.5" src="/assets/crate1.jpg"></a-box>`;
        this.script = new FPSCtrl(5).start()
        this.script.on('frame', () => this.update())

    }


    update() {

        this.current++;

        if (this.current > 20) return
        const block = new NPC()


        if (this.current > 17) {
            const item = new Item()
            item.title = "Item " + this.current
            this.engine.addEntity(item)
            return
        }


        const color = '#' + new THREE.Color(Math.random() * 255 * 255 * 255).getHex().toString(16)

        if (this.current % 5 != 0)
            block.putComponent(TemplateComponent).data = `<a-sphere radius=0.5 color="${color}"></a-sphere>`
        else
            block.putComponent(AssetsComponent)

        block.getComponent(DynamicBody).mass = 10

        this.engine.addEntity(block)

    }


}


import { FPSCtrl } from '../../common/FPSCtrl'
import { ComponentUpdateSystem } from "./ComponentUpdateSystem";
import { nosync } from "colyseus";



interface FOVEntry {
    distance: number;
    entity: Entity;
}


interface Initable {

    init: Function;
}


interface Updateable {
    update: Function;
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
                if (relative_velocity.y < -14) {
                    var damage = Math.abs(relative_velocity.y + 10) * 3;
                    console.log("damage taken", damage)
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

    maxSpeed = 3; // units per second

    direction = new THREE.Vector3()
    velocity = 0


    restrict2D = true
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
        else if (mEntity.hasComponent(BaseProperties3D)) {
            const position = mEntity.getComponent(BaseProperties3D).position
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


    interact() {
        console.log("interact TODO ")


    }


    update(mEntity: SerializableEntity) {
        let entries = mEntity.getComponent(ProximityComponent).entries

        entries = entries.sort((a, b) => a.distance - b.distance).filter(v => v.entity instanceof Item)

        if (entries.length==0) return

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
        entries.map(v => v.entity.getComponent(BaseProperties3D))


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
        let camera = new THREE.PerpectiveCamera()
        camera.updateMatrix();
        camera.updateMatrixWorld();
        var frustum = new THREE.Frustum();
        frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));


        let props = mEntity.getComponent(BaseProperties3D)

        camera.position.set(props.position)
        camera.rotation.set(props.rotation)


        //get ProximityComponent and its elements
        const proximity = mEntity.hasComponent(ProximityComponent) ? mEntity.getComponent(ProximityComponent) : mEntity.putComponent(ProximityComponent)

        //find elements within Field of view 
        for (let other of proximity.entries) {
            let oProps = other.entity.getComponent(BaseProperties3D)
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

