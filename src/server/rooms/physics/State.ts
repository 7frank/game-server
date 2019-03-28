import * as nanoid from "nanoid";
import { Entity, EntityType } from "./Entity";

const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;
const Ammo = NodePhysijs.Ammo;
const Physijs = NodePhysijs.Physijs(THREE, Ammo);



const WORLD_SIZE = 20;
const DEFAULT_PLAYER_RADIUS = 1;


import { createDemo } from "./demo"
let demoPhysics;

export class State {
  width = WORLD_SIZE;
  height = WORLD_SIZE;

  entities: { [id: string]: Entity } = {};

  constructor() {

    demoPhysics = createDemo()


    // create some food entities
    /*   for (let i = 0; i < 50; i++) {
         this.createFood();
       }*/
    let i = 0
    setInterval(() => {
      i++;

      if (i > 100) return
      this.createFood();


    }, 500)

  }

  createFood() {

    const pos = new THREE.Vector3(Math.random() * this.width, Math.random() * this.height, 0)

    const food = new Entity(demoPhysics.addEntity(pos, 1), 0.5);

    const id = nanoid()
    this.entities[id] = food;

  }

  createPlayer(sessionId: string) {

    const pos = new THREE.Vector3(Math.random() * this.width, Math.random() * this.height, 0)

    const body = demoPhysics.addEntity(pos, 1)
    body.setLinearFactor(new THREE.Vector3(0, 0, 0))
    body.setAngularFactor(new THREE.Vector3(0, 0, 0))
    const player = new Entity(body,
      DEFAULT_PLAYER_RADIUS
    );

    player.type = EntityType.kinematic

    this.entities[sessionId] = player


  }

  update() {

    demoPhysics.update()

    const deadEntities: string[] = [];
    for (const sessionId in this.entities) {
      const entity = this.entities[sessionId];

      if (entity.dead) {
        deadEntities.push(sessionId);
      }





      //    console.log(Object.values(this.entities)[0].rotation)


      if (entity.radius >= DEFAULT_PLAYER_RADIUS) {
        for (const collideSessionId in this.entities) {
          const collideTestEntity = this.entities[collideSessionId]



          // prevent collision with itself
          if (collideTestEntity === entity) { continue; }




          /*
                    if (Entity.distance(entity, collideTestEntity) < entity.radius) {
                      entity.radius += collideTestEntity.radius / 5;
                      collideTestEntity.dead = true;
                      deadEntities.push(collideSessionId);
          
                      // create a replacement food
                      if (collideTestEntity.radius < DEFAULT_PLAYER_RADIUS) {
                        this.createFood();
                      }
                    }
          */




        }
      }

      /*  if (entity.speed > 0) {
          entity.position.x -= (Math.cos(entity.angle)) * entity.speed;
          entity.position.y -= (Math.sin(entity.angle)) * entity.speed;
  
    
        }*/


      // apply boundary limits
      if (entity.position.x < -WORLD_SIZE / 2) { entity.position.x = -WORLD_SIZE / 2; }
      if (entity.position.x > WORLD_SIZE / 2) { entity.position.x = WORLD_SIZE / 2; }
      if (entity.position.y < -WORLD_SIZE / 2) { entity.position.y = -WORLD_SIZE / 2; }
      if (entity.position.y > WORLD_SIZE / 2) { entity.position.y = WORLD_SIZE / 2; }
      if (entity.position.z < -WORLD_SIZE / 2) { entity.position.z = -WORLD_SIZE / 2; }
      if (entity.position.z > WORLD_SIZE / 2) { entity.position.z = WORLD_SIZE / 2; }
    }

    // delete all dead entities
    deadEntities.forEach(entityId => delete this.entities[entityId]);
  }
}