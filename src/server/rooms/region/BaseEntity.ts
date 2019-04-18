import { nosync } from "colyseus";

const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;

export class BaseEntity {

    position=new THREE.Vector3();
   // rotation=new THREE.Vector3();
    canChangeRooms=false
    dead=false;

    constructor() {
   
     
    }

}