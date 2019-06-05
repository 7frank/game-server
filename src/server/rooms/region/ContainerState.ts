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
import { physicsJumpDemo } from "../../ecs/esc-examples";


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
    this._engine = new BaseEngine(boundingBox)
    physicsJumpDemo( this._engine)



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


