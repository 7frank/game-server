import { Component } from "@nova-engine/ecs";
import { Updateable, SerializableEntity, ProximityComponent, HealthComponent, Initable, JumpComponent, AnimationState } from "./TestComponents";
import { FPSCtrl } from "../../common/FPSCtrl";
import { PlayerAnimationStateMessage } from "../../common/types";

export
    enum HostilityState {
    friendly,
    neutral,
    hostile
}
// TODO model hostility
export class HostilityComponent implements Component {
    matrix = {
        players: HostilityState.friendly,
        redFaction1: HostilityState.hostile
    };
}
export class AttackComponent implements Component, Initable {


    attackSpeed = 0.1; 
    minDamage = 1
    maxDamage = 3


    init(mEntity: SerializableEntity): void {

        new FPSCtrl(1/this.attackSpeed).start().on("frame", () => {

            const proximity = mEntity.getComponent(ProximityComponent);
            proximity.entries.forEach(entry => {
              
                if (entry.entity.hasComponent(HealthComponent)) {
                    const health = entry.entity.getComponent(HealthComponent);
                    health.life.current -= this.minDamage;
                }
            });

        })

    }


}

export class RespawnComponent implements Component, Initable {

    time:number
    
   


    init(mEntity: SerializableEntity): void {
   
        this.time=Date.now()+1000*3

        console.log("respawn in 3")
        setTimeout(()=>{

            const playerHealth=mEntity.getComponent(HealthComponent) 
            playerHealth.life.current=playerHealth.life.maximum
            playerHealth.isAlive=true

            mEntity.getComponent(JumpComponent).jump()
            mEntity.getComponent(AnimationState).state=PlayerAnimationStateMessage.idle

            


            mEntity.removeComponent(RespawnComponent)

        },3000)
   


    }


}
