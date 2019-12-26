import { Room, Client } from "colyseus";

import { MessageTypes, PlayerAnimationStateMessage } from "../../../common/types"
import { Player, GenericBody, JumpComponent, ControllerComponent, InteractControllerComponent, AnimationState, LastPlayerCommand, HealthComponent } from "../../ecs/TestComponents";
import { DynamicBody } from "../../ecs/PhysicsSystem";
import { ContainerState } from "../region/ContainerState";
import { RespawnComponent } from "../../ecs/DamageComponents";
import { physicsJumpDemo } from "../../ecs/esc-examples";


const NodePhysijs = require('../../nodejs-physijs');
const THREE = NodePhysijs.THREE;

// FIXME can we use generics in here ? PhysicsContainerState, ContainerState, etc.
export class ContainerRoom extends Room<ContainerState> {


  constructor(...args) {
    super(...args)




    this.addListener(MessageTypes.serverEvent, (player: Player, { name, params }) => {
      player.emit(name, params)
    })


    this.addListener(MessageTypes.playerMove, (player: Player, data) => {


      const direction = new THREE.Vector3().copy(data)
      player.getComponent(ControllerComponent).direction.copy(direction.normalize())

    })

    this.addListener(MessageTypes.playerRotate, (player, data) => {

      //TODO improve position component
      if (player.body) {
        player.body.__dirtyRotation = true;
        player.body.rotation.copy(data)
      }
    })


    this.addListener(MessageTypes.playerJump, (player, data) => {
      const c = player.getComponent(JumpComponent)
      c.jump()
    })

    // TODO example state machine if (onground||jump1) => jump
    this.addListener(MessageTypes.playerInteractWith, (player, data) => {

      // TODO get closest element in front & if it's pickable/item do something with it
      //  player.getComponent(RaytracerComponent)
      player.getComponent(InteractControllerComponent).interact(player)


    })

    /* this.addListener(MessageTypes.playerDance, (player, data) => {
 
       const animState = player.getComponent(AnimationState)
      // if (animState.state == PlayerAnimationStateMessage.idle)
         animState.state = PlayerAnimationStateMessage.dance
 
     })*/






  }


  onInit(options) {

    console.log("initializing ContainerRoom", options)


    const mState = new ContainerState()

    physicsJumpDemo(mState._engine)

    // mState.maxFoodCount = options.boxCount || mState.maxFoodCount
    mState.data = options.data //|| mState.data
    if (options.position)
      mState.position.copy(options.position)


    // TODO 
    mState.boundingBox.copy(options.boundingBox)



    this.setState(mState);
    this.setSimulationInterval(() => this.state.update());
  }

  onJoin(client: Client, options: any) {
    console.log("client joined room:", this.roomName, "roomId", this.roomId, "clientId", client.sessionId)


    setTimeout(() => {
      console.log("create player");
      this.state.createPlayer(client.sessionId)
    }, 10000)
  }

  onMessage(client: Client, message: any) {
    const entity = this.state.entities[client.sessionId];

    // skip dead players
    if (!entity) {
      console.log("DEAD PLAYER ACTING...");
      return;
    }
    const [command, data] = message;


    entity.getComponent(LastPlayerCommand).command = command


    // prevent players sending all input commands but respawn query
    if (entity.hasComponent(HealthComponent)) {
      const c = entity.getComponent(HealthComponent)
      if (!c.isAlive) {

        if (!entity.hasComponent(RespawnComponent)) {
          const c = entity.putComponent(RespawnComponent)

          // TODO players should receive a dead screen or an instant respawn based on what the actual game play is
          entity.emit("request-respawn")

        }
        return
      }
    }



    this.emit(command, entity, data)
  }

  onLeave(client: Client) {
    const entity = this.state.entities[client.sessionId];

    delete this.state.entities[client.sessionId]

    // entity may be already dead.
    // if (entity) { entity.dead = true; }
  }

}
