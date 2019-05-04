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
    rotation= {x:0,y:0,z:0,order:"XYZ"}
}


export
    class PositionComponent extends THREE.Vector3 implements Component {
    static readonly tag = "core/PositionComponent";

}

export
    class VelocityComponent extends THREE.Vector3 implements Component {
    static readonly tag = "core/VelocityComponent";
    x = 0;
    y = 0;
}


// TODO
export
    class TemplateComponent implements Component {
    static readonly tag = "core/TemplateComponent";

    data: string = "<a-box></a-box>";

}


export
    class Room extends Engine {
    static readonly tag = "core/Room";

    constructor(public boundingBox: THREE.Box3) {
        super()

    }


    addEntity(entity){
        entity.engine=this
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
    engine:Room;

    constructor(id?:string) {
        super()
        this.id = id || nanoid();
    }


    toJSON() {
        const res = { name: this.constructor.name, id: this.id }

        this.listComponents().forEach(c => res[c.constructor.name] = c)


        return res

    }

}




export
    class Player extends SerializableEntity {

    constructor(id:string) {
        super(id)
        this.putComponent(BaseProperties3D)
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

  script:FPSCtrl;

  current=0;
  max=20;

    constructor() {
        super()
        this.putComponent(BaseProperties3D)


        this.script=new FPSCtrl(5).start()

        this.script.on('frame',()=> this.update())

    }


    update()
    {
       
        this.current++;

        if (this.current > 20) return
        const block = new NPC()
       this.engine.addEntity(block)

    }


}


import {FPSCtrl} from '../../common/FPSCtrl'


// TODO iterate components of entity and forward entity attribute to be able to handle certain effects on component level
export
    class XYZComponent implements Component {
    static readonly tag = "core/TemplateComponent";

    data: string = "<a-box></a-box>";

    update(mEntity:Entity)
    {



        
    }

}