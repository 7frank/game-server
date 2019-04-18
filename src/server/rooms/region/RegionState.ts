import * as nanoid from "nanoid";
import { BaseEntity } from "./BaseEntity";

const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;

import { nosync } from "colyseus";
import { getRandomInt } from "../../util";



export class RegionState extends THREE.Object3D {
  position: THREE.Vector3;
  boundingBox: THREE.Box3;


  public entities: { [id: string]: BaseEntity } = {};


  children: RegionState[] = []

  parent: RegionState = null

   toJSON():object {
     return {
       position: this.position,
       boundingBox:this.boundingBox
     }
   }
 

  constructor() {
    super()
    this.boundingBox = new THREE.Box3(new THREE.Vector3(-500, 0, -500), new THREE.Vector3(500, 200, 500))
  }


  createPlayer(sessionId: string) {

    const pos = new THREE.Vector3(getRandomInt(this.boundingBox.min.x, this.boundingBox.max.x), 2, getRandomInt(this.boundingBox.min.z, this.boundingBox.max.z))
    const player = new BaseEntity();
    player.canChangeRooms = true

    this.entities[sessionId] = player
  }

  update() {

    const deadEntities: string[] = [];
    for (const sessionId in this.entities) {
      const entity = this.entities[sessionId];


      if (entity.dead) {
        deadEntities.push(sessionId);
      }

      //restrict movement to within boundingBox
      if (!this.parent || !entity.canChangeRooms) {
        // apply boundary limits
        if (entity.position.x < this.boundingBox.min.x) { entity.position.x = this.boundingBox.min.x }
        if (entity.position.x < this.boundingBox.max.x) { entity.position.x = this.boundingBox.max.x }

        if (entity.position.y < this.boundingBox.min.y) { entity.position.y = this.boundingBox.min.y }
        if (entity.position.y < this.boundingBox.max.y) { entity.position.y = this.boundingBox.max.y }

        if (entity.position.z < this.boundingBox.min.z) { entity.position.z = this.boundingBox.min.z }
        if (entity.position.z < this.boundingBox.max.z) { entity.position.z = this.boundingBox.max.z }

      }


    }

    // delete all dead entities
    deadEntities.forEach(entityId => delete this.entities[entityId]);


  }
}