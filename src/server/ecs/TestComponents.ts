import { Component, Entity, Engine } from "@nova-engine/ecs";
import { DynamicBody } from "./PhysicsSystem";

const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;

import * as nanoid from 'nanoid'
import { Vector3 } from "three";


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


    id = "pineTree"
    src: string = "https://github.com/waverider404/game-assets/raw/master/Pine_Tree.glb";

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
    items: Item[];

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
    class Item extends Entity {

    constructor() {
        super()

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


        this.script = new FPSCtrl(5).start()

        this.script.on('frame', () => this.update())

    }


    update() {

        this.current++;

        if (this.current > 20) return
        const block = new NPC()

        const color = '#' + new THREE.Color(Math.random() * 255 * 255 * 255).getHex().toString(16)

        if (this.current % 5 != 0)
            block.putComponent(TemplateComponent).data = `<a-sphere radius=0.5 color="${color}"></a-sphere>`
        else
            block.putComponent(AssetsComponent)


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

