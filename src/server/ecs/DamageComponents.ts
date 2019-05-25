import { Component } from "@nova-engine/ecs";
import { Updateable, SerializableEntity, ProximityComponent, HealthComponent, Initable } from "./TestComponents";
import { FPSCtrl } from "../../common/FPSCtrl";

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
