

import { Engine, Family, System, FamilyBuilder, Component } from "@nova-engine/ecs";
import { BaseEngine, GenericBody } from "./TestComponents";




export
    class ComponentUpdateSystem extends System {

    family?: Family;

    // Constructors are free for your own implementation
    constructor() {
        super();

        // higher priorities means the system runs before others with lower priority
        this.priority = 400;


    }
    // This is called when a system is added to an engine, you may want to
    // startup your families here.
    onAttach(engine: BaseEngine) {

        // Needed to work properly
        super.onAttach(engine);
    }

    // This, in reality is the only method your system must implement
    // but using onAttach to prepare your families is useful.
    update(engine: Engine, delta: number) {


        for (let entity of engine.entities) {

            for (let component of entity.listComponents()) {


                //TODO handle init differently
                if (typeof component['init'] == 'function' && !component['__inited__']) {
                    component['init'](entity)
                    component['__inited__'] = true
                }

                if (typeof component['update'] == 'function')
                    component['update'](entity)
            }

        }
    }
}
