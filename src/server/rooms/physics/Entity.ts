import { nosync } from "colyseus";
import { BaseEntity } from "../region/BaseEntity";

const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;


export
    enum EntityType {
    kinematic = "kinematic",
    static = "static",
    dynamic = "dynamic"

}

const roundTo = (val) => Math.round(val * 100) / 100;

const vectorRoundTo = (val) => ({
    x: roundTo(val.x),
    y: roundTo(val.y),
    z: roundTo(val.z),
});


export class Entity extends BaseEntity {

    position: any//{ x: number, y: number, z: number }
    get rotation() {
        return this.body.rotation
    }
    dimesions:THREE.Vector3
    data:string="";

    type: EntityType = EntityType.dynamic;

    toJSON() {
        return {
            position: vectorRoundTo(this.position),
            rotation: vectorRoundTo(this.rotation),
            dimensions: vectorRoundTo(this.dimesions),
            type: this.type
        }
    }


    @nosync body: any;// physics body


    @nosync dead: boolean = false;
    @nosync angle: number = 0;
    @nosync speed = 0;

    constructor(body) {
        super()

        this.body = body
        this.position = this.body.position

        // this.rotation = this.body.rotation
    }

    static distance(a: Entity, b: Entity) {
        return a.position.distanceTo(b.position)
    }
}