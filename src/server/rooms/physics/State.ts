import * as nanoid from "nanoid";
import { Entity } from "./Entity";

const WORLD_SIZE = 2000;
const DEFAULT_PLAYER_RADIUS = 10;

const body = Symbol('body');

import { createDemo } from "./demo"
const demoPhysics = createDemo()

export class State {
  width = WORLD_SIZE;
  height = WORLD_SIZE;

  entities: { [id: string]: Entity } = {};

  constructor() {
    // create some food entities
    /*   for (let i = 0; i < 50; i++) {
         this.createFood();
       }*/
    let i = 0
    setInterval(() => {
      i++;
     
      if (i > 50) return
      this.createFood();


    }, 200)

  }

  createFood() {
    const food = new Entity(Math.random() * this.width, Math.random() * this.height, 9);

    food[body] = demoPhysics.addEntity(0.1)


    food[body].position.x = food.x
    food[body].position.y = food.y


    const id = nanoid()
    this.entities[id] = food;
console.log( food.x, food.y)


  }

  createPlayer(sessionId: string) {

    const player = new Entity(
      Math.random() * this.width,
      Math.random() * this.height,
      DEFAULT_PLAYER_RADIUS
    );

    player[body] = demoPhysics.addEntity(0)

    player[body].position.x = player.x
    player[body].position.y = player.y

    this.entities[sessionId] = player
  }

  update() {
    const deadEntities: string[] = [];
    for (const sessionId in this.entities) {
      const entity = this.entities[sessionId];

      if (entity.dead) {
        deadEntities.push(sessionId);
      }


      demoPhysics.update()

      if (entity.radius >= DEFAULT_PLAYER_RADIUS) {
        for (const collideSessionId in this.entities) {
          const collideTestEntity = this.entities[collideSessionId]



          // prevent collision with itself
          if (collideTestEntity === entity) { continue; }


          collideTestEntity.x = collideTestEntity[body].position.x
          collideTestEntity.y = collideTestEntity[body].position.y

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

      if (entity.speed > 0) {
        entity.x -= (Math.cos(entity.angle)) * entity.speed;
        entity.y -= (Math.sin(entity.angle)) * entity.speed;

        // apply boundary limits
        if (entity.x < 0) { entity.x = 0; }
        if (entity.x > WORLD_SIZE) { entity.x = WORLD_SIZE; }
        if (entity.y < 0) { entity.y = 0; }
        if (entity.y > WORLD_SIZE) { entity.y = WORLD_SIZE; }
      }
    }

    // delete all dead entities
    deadEntities.forEach(entityId => delete this.entities[entityId]);
  }
}