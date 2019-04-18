import * as nanoid from "nanoid";
import { Entity, EntityType } from "./Entity";

const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;
const Ammo = NodePhysijs.Ammo;
const Physijs = NodePhysijs.Physijs(THREE, Ammo);

import { nosync } from "colyseus";


const DEFAULT_PLAYER_RADIUS = 1;


import { createDemo } from "./demo"
import { RegionState } from "../region/RegionState";
import { getRandomInt } from "../../util";

export class State extends RegionState {


  entities: { [id: string]: Entity } = {};

  @nosync
  maxFoodCount=20
  data="";




  toJSON():object
  {
     return Object.assign(super.toJSON(),{data:this.data,entities:this.entities})
  }

  @nosync
  protected demoPhysics;

  constructor() {

    super()

    this.demoPhysics = createDemo()


    // create some food entities
    /*   for (let i = 0; i < 50; i++) {
         this.createFood();
       }*/
    let i = 0
    setInterval(() => {
      i++;

      if (i > this.maxFoodCount) return
      this.createFood();


    }, 200)

  }

  createFood() {

    const pos = new THREE.Vector3(getRandomInt(this.boundingBox.min.x, this.boundingBox.max.x), 2, getRandomInt(this.boundingBox.min.z, this.boundingBox.max.z))

    const food = new Entity(this.demoPhysics.addEntity(pos, 1), 0.5);

    const id = nanoid()
    this.entities[id] = food;

  }

  createPlayer(sessionId: string) {

    const pos = new THREE.Vector3(Math.random() * this.width,2 , Math.random() * this.height)

    const body = this.demoPhysics.addEntity(pos, 1)

    body.scale.set(1,2,1)

    body.setLinearFactor(new THREE.Vector3(0, 0, 0))
    body.setAngularFactor(new THREE.Vector3(0, 0, 0))
    const player = new Entity(body,
      DEFAULT_PLAYER_RADIUS
    );

    player.type = EntityType.kinematic

    this.entities[sessionId] = player


  }

  update() {

    this.demoPhysics.update()

    super.update()
  
  }
}