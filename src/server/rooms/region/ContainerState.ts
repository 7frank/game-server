import * as nanoid from "nanoid";

const NodePhysijs = require('../../nodejs-physijs');
const THREE = NodePhysijs.THREE;

import { nosync } from "colyseus";
import { getRandomInt } from "../../util";
import { SerializableEntity, GenericBody, BaseEngine, NPC, Player, SpawnPoint, NPCSteering } from "../../ecs/TestComponents";

import { Engine, Entity } from "@nova-engine/ecs";
import { PhysicsSystem } from "../../ecs/PhysicsSystem";
import { AssetTypes } from "../../../common/types";
import { SteeringBehaviourSystem, SteeringBody, SteeringActions } from "../../ecs/SteeringBehaviourSystem";






// Components can have custom constructors, but they must be able to be initialized
// with no arguments, because entities creates the instances for you.
// Try not to save complex data types in yout components

// If you are making a component library, and want to avoid collitions
// You can add a tag to your component implementations




class PhysicsECSEngine extends BaseEngine {

  constructor(boundingBox: THREE.Box3) {

    super(boundingBox)



    const physics = new PhysicsSystem();
    this.addSystem(physics)



  }

  demo1( npcCount = 20)
  {




    const spawnPoint = new SpawnPoint()

    spawnPoint.getComponent(GenericBody).position.y = this.boundingBox.max.y

    spawnPoint.max = npcCount
    this.addEntity(spawnPoint)

  


  }


  demo2( npcCount = 20)
  {


    const steering = new SteeringBehaviourSystem();
    this.addSystem(steering)


    const spawnPoint = new SpawnPoint()

    spawnPoint.getComponent(GenericBody).position.y = this.boundingBox.max.y

    spawnPoint.max = npcCount
    this.addEntity(spawnPoint)


   const test= new NPCSteering()
   this.addEntity(test)
   this.addEntity(new NPCSteering())
   this.addEntity(new NPCSteering())
   this.addEntity(new NPCSteering())
   this.addEntity(new NPCSteering())
  // test.getComponent(SteeringBody).mode=SteeringActions.wander

  


  }


}



class StaticECSEngine extends BaseEngine {

  constructor(boundingBox: THREE.Box3, npcCount = 20) {

    super(boundingBox)

    const spawnPoint = new SpawnPoint()

    spawnPoint.getComponent(GenericBody).position.y = 1

    spawnPoint.max = npcCount
    this.addEntity(spawnPoint)


  }



}



class Asset {

  title: string;
  description: string;

  constructor(public id: number | string, public type: AssetTypes, public src: string) {

  }
}


interface AssetsSetInterface {
  [id: string]: Asset;

}

class Assets {

  _assets: AssetsSetInterface = {}

  add(asset: Asset) {
    this._assets[asset.type] = asset;
  }

}


export class ContainerState extends THREE.Object3D {
  position: THREE.Vector3;
  boundingBox: THREE.Box3;

  assets: Assets = new Assets

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
        entities: res,
        assets:this.assets._assets
      })
  }


  constructor() {
    super()
    //  this.boundingBox = new THREE.Box3(new THREE.Vector3(-500, 0, -500), new THREE.Vector3(500, 200, 500))
    this.boundingBox = new THREE.Box3(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 10, 5))

    this.createEngine();


    this.assets.add(new Asset(0, AssetTypes.image, "/assets/test.png"))




  }


  createEngine() {

    const boundingBox = new THREE.Box3(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 15, 5))
    this._engine = new StaticECSEngine(boundingBox, 10)
    this.entities = this._engine._entities

  }

  createPlayer(sessionId: string) {

    const pos = new THREE.Vector3(getRandomInt(this.boundingBox.min.x, this.boundingBox.max.x), 9, 0)
    const player = new Player(sessionId);

    const props = player.getComponent(GenericBody)

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
  class PhysicsContainerState extends ContainerState {




  createEngine() {

    const boundingBox = new THREE.Box3(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 10, 5))
    
    const physicsEngine= new PhysicsECSEngine(boundingBox)
    physicsEngine.demo1(5)
   // physicsEngine.demo2(20)

    this._engine = physicsEngine

   

    this.entities = this._engine._entities

  }

}
