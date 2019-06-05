import { Room, Client } from "colyseus";

import { MessageTypes } from "../../../common/types"
import { Player, GenericBody } from "../../ecs/TestComponents";
import { DynamicBody } from "../../ecs/PhysicsSystem";
import { ContainerState } from "../region/ContainerState";
import { physicsJumpDemo } from "../../ecs/esc-examples";



/**
 * The region/container should handle player movement and forward movement messages to child rooms within the region which should notcommunicate directly with the players
 * - the region tells the client which containers within the region he has to connect to to receive further game data
 * - it handles loading unloading of container when certain criteria ( e.g. distance ) is met
 */

export class RegionRoom extends Room<ContainerState> {


  constructor(...args) {
    super(...args)


    this.addListener(MessageTypes.playerMove, (player: Player, data) => {


      if (player.hasComponent(DynamicBody)) {
        const body = player.getComponent(DynamicBody).body
        if (!body) return // waiting for physics to init body
        // console.log(player,data)
        body.__dirtyPosition = true;
        body.position.copy(data)
      }
      else if (player.hasComponent(GenericBody)) {
        const position = player.getComponent(GenericBody).position

        position.copy(data)
      }


    })


    this.addListener(MessageTypes.playerRotate, (player, data) => {
      // player.body.__dirtyRotation = true;
      // player.body.rotation.copy(data)
    })

    // TODO example state machine if (onground||jump1) => jump
    this.addListener(MessageTypes.playerJump, (player, data) => {
      //TODO
    })



  }


  onInit(options) {

    console.log("initializing region", options)



    const mState = new ContainerState()
   // physicsJumpDemo(mState._engine)


    mState.maxFoodCount = options.boxCount || mState.maxFoodCount
    mState.data = options.data //|| mState.data
    if (options.position)
      mState.position.copy(options.position)


    // TODO 
    mState.boundingBox.copy(options.boundingBox)



    this.setState(mState);
    this.setSimulationInterval(() => this.state.update());
  }

  onJoin(client: Client, options: any) {
    console.log("client joined region:", this.roomName, "roomId", this.roomId, "clientId", client.sessionId)

    this.state.createPlayer(client.sessionId);
  }

  onMessage(client: Client, message: any) {
    const entity = this.state.entities[client.sessionId];

    // skip dead players
    if (!entity) {
      console.log("DEAD PLAYER ACTING...");
      return;
    }
    const [command, data] = message;

    this.emit(command, entity, data)
  }

  onLeave(client: Client) {
    const entity = this.state.entities[client.sessionId];

    delete this.state.entities[client.sessionId]

  }

}
