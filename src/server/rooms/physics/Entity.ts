import { nosync } from "colyseus";
import bodyParser = require("body-parser");

export
enum EntityType
{
    kinematic="kinematic",
    static="static",
    dynamic="dynamic"

}

export class Entity {

    position: any//{ x: number, y: number, z: number }
    get rotation() {
        return this.body.rotation
    }

    radius: number;

    type:EntityType=EntityType.dynamic;

    toJSON(){

        return {
            position:this.position,
            rotation:this.rotation,
            type:this.type,
            radius:this.radius
        }

    }


    @nosync body: any;// physics body


    @nosync dead: boolean = false;
    @nosync angle: number = 0;
    @nosync speed = 0;

    constructor(body, radius: number) {
        this.body = body
        this.position = this.body.position
       // this.rotation = this.body.rotation

        this.radius = radius;
    }

    static distance(a: Entity, b: Entity) {
        return a.position.distanceTo(b.position)
    }
}