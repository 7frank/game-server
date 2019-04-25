import { Component, Entity, Engine } from "@nova-engine/ecs";
import { DynamicBody } from "./PhysicsSystem";

const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;


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

    data:string="<a-box></a-box>";
    
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


export
    class Actor extends Entity {

    constructor() {
        super()
        this.putComponent(PositionComponent)
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





