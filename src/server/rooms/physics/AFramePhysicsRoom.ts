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

test=1

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
    // change angle
    if (command === "mouse") {

      const dst = Entity.distance(entity, { position: data } as Entity);
      entity.speed = (dst < 20) ? 0 : Math.min(dst / 10, 6);
      entity.angle = Math.atan2(entity.position.y - data.y, entity.position.x - data.x);
    } else if (command === MessageTypes.playerMove) {
      // console.log(command,data)
      entity.body.__dirtyPosition = true;
      entity.position.copy(data)

    }
    else if (command === MessageTypes.playerRotate) {
      // console.log(command,data)
      entity.body.rotation.copy(data)
      entity.body.__dirtyRotation = true;


    }





  }

  onLeave(client: Client) {
    const entity = this.state.entities[client.sessionId];

    // entity may be already dead.
    if (entity) { entity.dead = true; }
  }

}
