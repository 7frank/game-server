import { nosync } from "colyseus";


const NodePhysijs = require('../../nodejs-physijs');
const THREE = NodePhysijs.THREE;


export
    enum EntityType {
    kinematic = "kinematic",
    static = "static",
    dynamic = "dynamic"

}

const roundTo = (val) => Math.round(val * 100) / 100;

const vectorRoundTo = (val) => ({
    x: roundTo(val.x),
    y: roundTo(val.y),
    z: roundTo(val.z),
});

