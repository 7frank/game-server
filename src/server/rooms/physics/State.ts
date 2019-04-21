import * as nanoid from "nanoid";
import { Entity, EntityType } from "./Entity";

const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;
const Ammo = NodePhysijs.Ammo;
const Physijs = NodePhysijs.Physijs(THREE, Ammo);

import { nosync } from "colyseus";





import { createDemo } from "./demo"
import { RegionState } from "../region/RegionState";
import { getRandomInt } from "../../util";

export class State extends RegionState {


  entities: { [id: string]: Entity } = {};

  @nosync
  maxFoodCount = 20
  data = "";


  toJSON(): object {
    return Object.assign(super.toJSON(), { data: this.data, entities: this.entities })
  }

  @nosync
  protected demoPhysics;

  constructor() {

    super()

    this.demoPhysics = createDemo()


    // create some food entities
    let i = 0
    setInterval(() => {
      i++;

      if (i > this.maxFoodCount) return
      this.createFood();


    }, 200)

  }

  createFood() {

    const pos = new THREE.Vector3(getRandomInt(this.boundingBox.min.x, this.boundingBox.max.x), this.boundingBox.max.y, getRandomInt(this.boundingBox.min.z, this.boundingBox.max.z))

    const dimensions=[Math.random()+1,Math.random()+1,Math.random()+1]

    const food = new Entity(this.demoPhysics.addEntity(pos,dimensions, 10));

    food.dimesions=new THREE.Vector3(...dimensions)

    const id = nanoid()
    this.entities[id] = food;

  }

  createPlayer(sessionId: string) {

   // const pos = new THREE.Vector3(Math.random() * this.width, 2, Math.random() * this.height)
    const pos = new THREE.Vector3(0, 0, 0)
    const dimensions=[1,2,1]
    const body = this.demoPhysics.addEntity(pos,dimensions, 1)


    body.setLinearFactor(new THREE.Vector3(0, 0, 0))
    body.setAngularFactor(new THREE.Vector3(0, 0, 0))
    const player = new Entity(body);
    player.dimesions=new THREE.Vector3(...dimensions)

    


    player.type = EntityType.kinematic

    this.entities[sessionId] = player


  }

  update() {

    this.demoPhysics.update()

    // TODO instead of relying on super boundingBox behaviour we could reflect entities at boundingBox via physics
    super.update()

  }
}