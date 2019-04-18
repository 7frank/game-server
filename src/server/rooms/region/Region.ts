import { Room, Client } from "colyseus";
import { BaseEntity } from "./BaseEntity";
import { RegionState } from "./RegionState";
import {MessageTypes} from "../../../common/types"



export class Region extends Room<RegionState> {



  onInit(options) {

const mState=new RegionState()
mState.position.copy(options.position)
mState.boundingBox.copy(options.boundingBox)


    this.setState(mState);
    this.setSimulationInterval(() => this.state.update());
  }

  onJoin(client: Client, options: any) {
    console.log("client joined region:",this.roomName,"roomId",this.roomId,"clientId",client.sessionId)
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

    if (command === MessageTypes.playerMove) 
    {
      entity.position.copy(data)

    }
   
  }

  onLeave(client: Client) {
    const entity = this.state.entities[client.sessionId];

    // entity may be already dead.
    if (entity) { entity.dead = true; }
  }

}
