import * as nanoid from "nanoid";

const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;

import { nosync } from "colyseus";
import { getRandomInt } from "../../util";
import { SerializableEntity, Player, BaseProperties3D } from "../../ecs/TestComponents";
import { createRoom } from "../../ecs";



export class RegionState extends THREE.Object3D {
  position: THREE.Vector3;
  boundingBox: THREE.Box3;


  public entities: { [id: string]: SerializableEntity } = {};


  children: RegionState[] = []

  parent: RegionState = null

 

   escEngine


   toJSON(): object {
 
 
     const res = {}
 
     if (this.escEngine)
       this.escEngine._entities.forEach(c => res[c.id] = c)
 
 
     return Object.assign({
      position: this.position,
      boundingBox:this.boundingBox
    }, {
       data: this.data,
       // entities: this.entities,
       entities: res
     })
   }


  constructor() {
    super()
  //  this.boundingBox = new THREE.Box3(new THREE.Vector3(-500, 0, -500), new THREE.Vector3(500, 200, 500))
  this.boundingBox = new THREE.Box3(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 10, 5))

  this.initRoom();

  }

  
  initRoom() {

    this.escEngine = createRoom()
    this.entities=this.escEngine._entities

  }  

  createPlayer(sessionId: string) {

    const pos = new THREE.Vector3(getRandomInt(this.boundingBox.min.x, this.boundingBox.max.x), 2, getRandomInt(this.boundingBox.min.z, this.boundingBox.max.z))
    const player = new Player(sessionId);

    const props=player.getComponent(BaseProperties3D)

    props.position.copy(pos)

   // player.canChangeRooms = true

    // override auto-id with session id
   
    this.entities[sessionId] = player
    this.escEngine.addEntity(player)



    return player
  }

 
  update() {

    if (this.escEngine)
      this.escEngine.update()

  }
}