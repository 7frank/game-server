import { Room, Client } from "colyseus";
import { Entity } from "./Entity";
import { State } from "./State";
import { MessageTypes } from "../../../common/types"

const roomTemplate = `
<a-scene physics="debug: true">
<a-entity dynamic-body camera look-controls wasd-controls kinematic-body position="0 1.6 0"></a-entity>
<!-- Camera -->
<a-entity camera look-controls></a-entity>

<!-- Floor -->

<a-plane static-body color="#CCC" height="20" width="20" rotation="-90 0 0"></a-plane>
<!-- Immovable box -->
<a-box static-body position="0 0.5 -5" width="3" height="1" depth="1"></a-box>

<a-sphere dynamic-body position="0 5 0" radius="1"></a-sphere>


<!-- Dynamic box -->
<a-box dynamic-body position="5 0.5 0" width="1" height="1" depth="1"></a-box>

</a-scene>
`


export class AFramePhysicsRoom extends Room<State> {


  constructor(...args) {
    super(...args)

    this.addListener(MessageTypes.playerMove, (player,data) => {

     // console.log(command,data)
     player.body.__dirtyPosition = true;
     player.position.copy(data)


    })


    this.addListener(MessageTypes.playerRotate, (player,data) => {
      player.body.__dirtyRotation = true;
      player.body.rotation.copy(data)
     })

    // TODO example state machine if (onground||jump1) => jump
     this.addListener(MessageTypes.playerJump, (player,data) => {
     //TODO
     })



  }


  onInit(options) {

    console.log("initializing AFramePhysicsRoom", options)

    const jsdom = require("jsdom");
    const { JSDOM } = jsdom;
    const dom = new JSDOM(`<!DOCTYPE html>` + roomTemplate);
    const window = dom.window
    const document = dom.window.document

    const elements = {
      static: document.querySelectorAll("[static-body]"),
      dynamic: document.querySelectorAll("[dynamic-body]"),
      players: document.querySelectorAll("[kinematic-body]")
    }





    const mState = new State()
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
    console.log("client joined room:", this.roomName, "roomId", this.roomId, "clientId", client.sessionId)
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
    this.emit(command,entity,data)
  }

  onLeave(client: Client) {
    const entity = this.state.entities[client.sessionId];

    // entity may be already dead.
    if (entity) { entity.dead = true; }
  }

}
