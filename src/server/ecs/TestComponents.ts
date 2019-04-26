import { Component, Entity, Engine } from "@nova-engine/ecs";
import { DynamicBody } from "./PhysicsSystem";

const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;

import * as nanoid from 'nanoid'
import { Vector3 } from "three";


export
    class BaseProperties3D implements Component {
    static readonly tag = "core/BaseEntity3D";
    position: THREE.Vector3 = new THREE.Vector3
    rotation: THREE.Vector3 = new THREE.Vector3
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
}





export
    class Inventory implements Component {
    static readonly tag = "core/Inventory";
    items: Item[];

}

class SerializableEntity extends Entity {


    constructor() {
        super()
        this.id = nanoid();
    }


    toJSON() {
        const res = { name: this.constructor.name, id: this.id }

        this.listComponents().forEach(c => res[c.constructor.name] = c)


        return res

    }

}






export
    class Actor extends SerializableEntity {

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





