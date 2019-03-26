import { Room, Client } from "colyseus";
import { Entity } from "./Entity";
import { State } from "./State";


const jsdom = require("jsdom-wc");
const { JSDOM } = jsdom;
//const { window } = new JSDOM(`<!DOCTYPE html>`);

function exposeGlobal(dom)
{

//const dom=new JSDOM(``);
// @ts-ignore
global.document = dom.window.document

// @ts-ignore
document.window = dom.window;

// @ts-ignore
global.window = document.window;

var requestAnimationFrame = require('raf')
//const document = dom.window.document
// const window = dom.window
window.requestAnimationFrame=requestAnimationFrame;




Object.keys(document['window']).forEach((property) => {
  console.log(property)
  if (typeof global[property] === 'undefined') {
    global[property] = document['window'][property];
  }
});
// @ts-ignore
global.navigator = {
  userAgent: 'node.js'
};


require("../../../../aframe-headless-2/dist/aframe-master.js");

}

async function getAFRAMETestDOM() {

  const virtualConsole = new jsdom.VirtualConsole();
  virtualConsole.on("error", console.error);
  virtualConsole.on("warn", console.warn);
  virtualConsole.on("info", console.info);
  virtualConsole.on("dir", console.dir);

  const dom = JSDOM.fromURL(`http://localhost:8080/src/client/aframe.html`, {
    //url: "http://localhost:8080/aframe.html",
    //referrer: "https://example.com/",
    // contentType: "text/html",
    includeNodeLocations: true,
    storageQuota: 10000000,
    virtualConsole,
    runScripts: "dangerously",
    resources: "usable"
  });

dom.then(dom=>{

  exposeGlobal(dom)

  return dom
})


  return dom

}


const mDOM = getAFRAMETestDOM()
mDOM.then(dom => {

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(dom)

    }, 3000)

  })

}).then(function (dom: any) {
  return new Promise((resolve, reject) => {
    const document = dom.window.document
    const window = dom.window

   
    let scene = null;
    const id = setInterval(() => {

      if (!scene) {
        scene = document.body.querySelector("a-scene");
       // if (scene) scene.load()
      }
      if (scene) {
        console.log("-----------inited---------------")





        
        scene.addEventListener('loaded', function () {
          resolve(dom)
        })


        scene.addEventListener('renderstart', function () {
          resolve(dom)
        })

        resolve(dom)

        clearInterval(id);
        
       /* if (scene.object3D) {
          console.log("whoot",scene.innerHTML)
          resolve(dom)
          clearInterval(id);
        }*/
      }

    }, 100)

  })



}).then((dom: any) => {





/*
  window.constructor.prototype.resizeTo = function (width, height) {
    this.innerWidth = this.outerWidth = width;
    this.innerHeight = this.outerHeight = height;
  };
  window.resizeTo(1, 1);
*/

  const scene = document.querySelector("a-scene")

  //only for those elements we need to create the physics
 /* const items = [scene.querySelectorAll("dynamic-body"),
  scene.querySelectorAll("static-body"),
  scene.querySelectorAll("kinematic-body")
  ];
*/


  let start = null
  function step(timestamp) {
    if (!start) start = timestamp;
    var progress = timestamp - start;
    const sphere :any = scene.querySelectorAll("a-sphere")
    if (sphere[0].object3D)
      console.log(sphere[0].object3D.position)
    else
    console.log(sphere[0].object3D)
    if (progress < 15000) {
      window.requestAnimationFrame(step);
    }
  }
  window.requestAnimationFrame(step);


  console.log("-----------loaded---------------")





}).catch(console.error)


export class AFramePhysicsRoom extends Room {

  mDOM;

  onInit() {

    console.log("initializing AFramePhysicsRoom")
    this.mDOM = getAFRAMETestDOM()




    this.setState(new State());
    this.setSimulationInterval(() => this.state.update());
  }

  onJoin(client: Client, options: any) {
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
      const dst = Entity.distance(entity, data as Entity);
      entity.speed = (dst < 20) ? 0 : Math.min(dst / 10, 6);
      entity.angle = Math.atan2(entity.y - data.y, entity.x - data.x);
    }
  }

  onLeave(client: Client) {
    const entity = this.state.entities[client.sessionId];

    // entity may be already dead.
    if (entity) { entity.dead = true; }
  }

}
