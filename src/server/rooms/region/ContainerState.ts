import * as nanoid from "nanoid";

const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;

import { nosync } from "colyseus";
import { getRandomInt } from "../../util";
import { SerializableEntity, BaseProperties3D, BaseEngine, NPC, Player, SpawnPoint } from "../../ecs/TestComponents";

import { Engine, Entity } from "@nova-engine/ecs";
import { PhysicsSystem } from "../../ecs/PhysicsSystem";






// Components can have custom constructors, but they must be able to be initialized
// with no arguments, because entities creates the instances for you.
// Try not to save complex data types in yout components

// If you are making a component library, and want to avoid collitions
// You can add a tag to your component implementations




class PhysicsECSEngine extends BaseEngine {

  constructor(boundingBox:THREE.Box3,npcCount = 20) {

    super(boundingBox)



    const physics = new PhysicsSystem();
     
   
    this.addSystem(physics)
    const spawnPoint = new SpawnPoint()
  
    spawnPoint.getComponent(BaseProperties3D).position.y=boundingBox.max.y
  
    spawnPoint.max = npcCount
    this.addEntity(spawnPoint)
  

  }



}



class StaticECSEngine extends BaseEngine {

  constructor(boundingBox:THREE.Box3,npcCount = 20) {

    super(boundingBox)

    const spawnPoint = new SpawnPoint()
  
    spawnPoint.getComponent(BaseProperties3D).position.y=1
  
    spawnPoint.max = npcCount
    this.addEntity(spawnPoint)
  

  }



}








export class ContainerState extends THREE.Object3D {
  position: THREE.Vector3;
  boundingBox: THREE.Box3;


  public entities: { [id: string]: SerializableEntity } = {};


  children: ContainerState[] = []

  parent: ContainerState = null



  _engine


  toJSON(): object {


    const res = {}

    if (this._engine)
      this._engine._entities.forEach(c => res[c.id] = c)


    return Object.assign({
      position: this.position,
      boundingBox: this.boundingBox
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

    this.createEngine();

  }


  createEngine() {

    const boundingBox = new THREE.Box3(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 10, 5))
    this._engine = new StaticECSEngine(boundingBox,10)
    this.entities = this._engine._entities

  }

  createPlayer(sessionId: string) {

    const pos = new THREE.Vector3(getRandomInt(this.boundingBox.min.x, this.boundingBox.max.x), 2, getRandomInt(this.boundingBox.min.z, this.boundingBox.max.z))
    const player = new Player(sessionId);

    const props = player.getComponent(BaseProperties3D)

    props.position.copy(pos)

    // player.canChangeRooms = true

    // override auto-id with session id

    this.entities[sessionId] = player
    this._engine.addEntity(player)



    return player
  }


  update() {

    if (this._engine)
      this._engine.update()

  }
}



export 
class PhysicsContainerState extends ContainerState
{




  createEngine() {

    const boundingBox = new THREE.Box3(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 10, 5))
    this._engine = new PhysicsECSEngine(boundingBox,20)
    this.entities = this._engine._entities

  }

}
