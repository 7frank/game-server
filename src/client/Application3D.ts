import * as PIXI from "pixi.js";
import * as Viewport from "pixi-viewport";
import { Client, DataChange } from "colyseus.js";

import { Room } from "colyseus";
import { create } from "domain";
import { MessageTypes, ChatMessageTypes } from "../common/types";
import { Hotkeys } from "@nk11/keyboard-interactions";
import { FPSCtrl } from "./FPSCtrl";
import { BaseProperties3D } from "../server/ecs/TestComponents";
import { createRegion, createEntity, createEntityFromData, createEntityHTML } from "./dom-utils";

var parseHTML = require('parsehtml');

//import 'aframe-extras'
import "three/examples/js/loaders/FBXLoader.js"
//import 'aframe-extras/src/loaders/animation-mixer.js'


const PLAYER_SIZE = 1.8
// @ts-ignore
const THREE = window.THREE
// @ts-ignore
const AFRAME = window.AFRAME
const Zlib = require("three/examples/js/libs/inflate.min");
// @ts-ignore
window.Zlib = Zlib.Zlib;

import fbx_animation from './components/fbx-animation'
AFRAME.registerComponent("fbx-animation", fbx_animation)
import './components/animation-mixer'



AFRAME.registerComponent('wireframe', {
    dependencies: ['material'],
    init: function () {
        this.el.components.material.material.wireframe = true;
    }
});









const ENDPOINT = (process.env.NODE_ENV === "development")
    ? "ws://" + window.location.host
    : "wss://colyseus-pixijs-boilerplate.herokuapp.com";

const WORLD_SIZE = 20;

export const lerp = (a: number, b: number, t: number) => (b - a) * t + a


type EntityMap = { [id: string]: any }
type RoomEntityMap = { [id: string]: EntityMap }





export class Application3D {
    //entities: EntityMap = {};

    roomEntitiesMap: RoomEntityMap = {}


    currentPlayerEntity: any;//PIXI.Graphics;

    client = new Client(ENDPOINT);

    activeRoom;

    activeChat;

    connectedRooms: Room[] = []


    viewport: Viewport;


    scene: any;
    sceneEl: any
    _axisListener: any;
    _interpolation: boolean;

    constructor(sceneEl) {
        this.sceneEl = sceneEl
        this.scene = sceneEl.object3D// init3DScene(scene)




        var camera = sceneEl.camera.el;
        camera.addEventListener('rotationChanged', (evt) => {
            if (this.currentPlayerEntity) {

                let { x, y, z } = evt.detail;
                x = x / 180 * Math.PI
                y = y / 180 * Math.PI
                z = z / 180 * Math.PI

                this.activeRoom.send([MessageTypes.playerRotate, { x, y, z }]);
            }
        });






        // @ts-ignore FIXME
        setTimeout(() => document.querySelector("[camera]").removeAttribute("wasd-controls"), 2000)


        let cameraDistance = 0
        sceneEl.addEventListener("wheel", event => {

            const el = this.currentPlayerEntity.el

            el.setAttribute("visible", true);
            cameraDistance += event.deltaY > 0 ? 1 : -1
            if (cameraDistance < 0) cameraDistance = 0
            if (cameraDistance > 10) cameraDistance = 10

            sceneEl.camera.position.set(0, 0, cameraDistance);
            this.currentPlayerEntity.traverse(c => { if (c.material) { c.material.opacity = cameraDistance > 3 ? 1 : (cameraDistance / 10); c.material.transparent = true } })
            console.info(event.deltaY)


        });




        // TODO send direction vector instead & only update positions based on direction * current speed

        const keys = { w: 0, a: 0, s: 0, d: 0 }

        const movePlayer = () => {

            const mesh = sceneEl.camera.el.object3D


            var direction0 = new THREE.Vector3(0, 0, -1).applyQuaternion(mesh.quaternion);


            direction0.y = 0

            let upVector = new THREE.Vector3(0, 1, 0)


            const forward = direction0.clone()
            const left = direction0.clone().applyAxisAngle(upVector, Math.PI / 2)
            const right = direction0.clone().applyAxisAngle(upVector, -Math.PI / 2)
            const backward = direction0.clone().applyAxisAngle(upVector, Math.PI)

            const direction = new THREE.Vector3
            if (keys.w) direction.add(forward)
            if (keys.a) direction.add(left)
            if (keys.d) direction.add(right)
            if (keys.s) direction.add(backward)



            direction.normalize().multiplyScalar(0.1)

            this.activeRoom.send([MessageTypes.playerMove, direction]);
            // @ts-ignore
            // document.querySelector("[camera]").object3D.position.add(direction)
        }



        Hotkeys.register("test", 'F1', {
            // category: 'HUD',
            target: this.sceneEl
        });

        Hotkeys.register("test2", 'F2', {
            // category: 'HUD',
            target: this.sceneEl
        });

        Hotkeys.register("test3", 'F3', {
            // category: 'HUD',
            target: this.sceneEl
        });

        Hotkeys().on("test", (evt) => {
            console.log("aaa test")
            const el = parseHTML(`<a-entity id="test" position="0 1 2" gltf-model="src: url(/assets/claire.glb);"></a-entity>`)

            sceneEl.append(el)

        });


        Hotkeys().on("test2", (evt) => {
            console.log("aaa test2")

            var helper = new THREE.SkeletonHelper((document.querySelector("#test") as any).object3D);
            helper.material.linewidth = 3;
            this.scene.add(helper);

            document.querySelector("#test").setAttribute("fbx-animation__2", "name: walk;src: url(/assets/animations/Samba Dancing.fbx);")
        });
        Hotkeys().on("test3", (evt) => {
            console.log("aaa test3")
            document.querySelector("#test").setAttribute("animation-mixer", "clip: walk;crossFadeDuration: 1; useSkinnedMeshRoot: true;")
        });



        Hotkeys.register(MessageTypes.playerMove + "-forward", 'w', {
            // category: 'HUD',
            target: this.sceneEl
        });

        Hotkeys().on(MessageTypes.playerMove + "-forward", (evt) => {
            keys.w = 1
            movePlayer()
        }, function () {
            keys.w = 0
            movePlayer()
        });


        Hotkeys.register(MessageTypes.playerMove + "-backward", 's', {
            // category: 'HUD',
            target: this.sceneEl
        });
        Hotkeys().on(MessageTypes.playerMove + "-backward", (evt) => {
            keys.s = 1
            movePlayer()
        }, function () {
            keys.s = 0
            movePlayer()
        });

        Hotkeys.register(MessageTypes.playerMove + "-left", 'a', {
            // category: 'HUD',
            target: this.sceneEl
        });
        Hotkeys().on(MessageTypes.playerMove + "-left", (evt) => {
            keys.a = 1
            movePlayer()
        }, function () {
            keys.a = 0
            movePlayer()
        });

        Hotkeys.register(MessageTypes.playerMove + "-right", 'd', {
            // category: 'HUD',
            target: this.sceneEl
        });
        Hotkeys().on(MessageTypes.playerMove + "-right", (evt) => {
            keys.d = 1
            movePlayer()
        }, function () {
            keys.d = 0
            movePlayer()
        });



        // @ts-ignore
        Hotkeys.register(MessageTypes.playerJump, 'space', {
            // category: 'HUD',
            target: this.sceneEl
        });

        /*    // TODO use animation lib to create the path via functions
            function createJumpCurve(entity) {
                const dir = entity.getWorldDirection();
                const pos = entity.position.clone()
    
                // Create a sine-like wave
                var curve = new THREE.SplineCurve([
                    pos,
                    pos.clone().add(dir),
                    new THREE.Vector2(0, 0),
                    new THREE.Vector2(5, -5),
                    new THREE.Vector2(10, 0)
                ]);
    
    
                return curve
    
    
            }
    */

        // FIXME implement server side phyiscs based jumping and see where that leads us
        // https://github.com/chandlerprall/Physijs/issues/147

        /*   let jumpCurve
           let downForce = 0
           let jumping = false
           const jumpScript = new FPSCtrl(50)
           jumpScript.start()
           jumpScript.on('frame', () => {
   
               //  if (!jumpCurve)  jumpCurve= createJumpCurve(this.currentPlayerEntity)
                    
                     
   
   
               // TODO jump should block all move commands while jumping
               //this.room.send([MessageTypes.playerJump, {}]);
   
               var camera = sceneEl.camera.el.object3D;
               let pos = camera.position//this.currentPlayerEntity.position
               let posBefore = pos.clone()
   
               if (jumping)
                   pos.y += 0.06
               else if (pos.y > PLAYER_SIZE)
                   pos.y -= (downForce += 0.01)
   
               if (pos.distanceTo(posBefore) > 0.05) {
                   this.activeRoom.send([MessageTypes.playerMove, pos]);
                   console.log("jumping")
               }
           })
   */

        /*  Hotkeys().on(MessageTypes.playerJump, (evt) => {
  
              if (this.currentPlayerEntity && !jumping) {
                  // console.log("jump on")
                  //  jumpScript.start()
                  jumping = true
                  downForce = 0
              }
          }, function () {
              //  jumpScript.stop()
              //  console.log("jump off")
              jumping = false
          });
  */

        Hotkeys().on(MessageTypes.playerJump, (evt) => {

            this.activeRoom.send([MessageTypes.playerJump, {}]);


        }, function () {
            //  jumpScript.stop()
            //  console.log("jump off")
            //  jumping = false
        });



        Hotkeys.register(MessageTypes.playerInteractWith, 'e', {
            target: this.sceneEl
        });
        Hotkeys().on(MessageTypes.playerInteractWith, (evt) => {
            this.activeRoom.send([MessageTypes.playerInteractWith, {}]);
            console.log("interactWith")
        });



        Hotkeys.register("ChangeChannel", '1', {
            target: this.sceneEl
        });



        Hotkeys().on("ChangeChannel", (evt) => {
            this.joinRoom("aframe-region-1");

        });



        Hotkeys.register("ChangeChannel2", '2', {
            target: this.sceneEl
        });



        Hotkeys().on("ChangeChannel2", (evt) => {
            this.joinRoom("aframe-region-2", "green", "15 0 0");

        });



        Hotkeys.register("ChangeChannel3", '3', {
            target: this.sceneEl
        });



        Hotkeys().on("ChangeChannel3", (evt) => {
            this.joinRoom("world-1", "red", "0 -1 0");

        });





        this.joinRoom("aframe-region-1")
        this.joinChat("global-chat")

        //    this.interpolation = true;

    }


    initializeRoom(room, sceneEl) {
        // init map
        if (!this.roomEntitiesMap[room.sessionId]) this.roomEntitiesMap[room.sessionId] = {}

        const entitiesInRoom = this.roomEntitiesMap[room.sessionId]

        // add / removal of entities
        room.listen("entities/:id", (change: DataChange) => {
            //console.log("DataChange:", change)

            if (change.operation === "add") {

                let color;
                switch (change.value.name) {
                    case "Player": color = 0xff0000; break;
                    case "NPC": color = 0xFFFF0B; break;
                    default: color = 0x000000; break;
                }




                const isCurrentPlayer = change.path.id === room.sessionId

                const isPlayerCharacter = change.value.name == "Player" // change.value.KinematicBody != undefined


                if (isPlayerCharacter) {
                    console.log("Player added:")

                    console.log("sessionId:", this.activeRoom.sessionId)
                    console.log("change.path.id:", change.path.id)
                    console.log("isCurrentPlayer", isCurrentPlayer)


                    const el = createEntityHTML("#claire", "Player " + room.sessionId)
                    sceneEl.append(el)

                    entitiesInRoom[change.path.id] = el.object3D

                    if (change.value.BaseProperties3D)
                        el.object3D.position.copy(change.value.BaseProperties3D.position);

                    if (isCurrentPlayer) {
                        this.currentPlayerEntity = el.object3D;
                        el.setAttribute("visible", false);
                    }

                    el.addEventListener('model-loaded', () => {

                    })





                    // FIXME Dimensions
                    change.value.dimensions = { x: 1, y: 2, z: 1 }

                    //bounding box
                    var box = new THREE.Box3();
                    //box.setFromCenterAndSize(new THREE.Vector3(0, -PLAYER_SIZE / 2, 0), new THREE.Vector3().copy(change.value.dimensions));
                    box.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));


                    var helper = new THREE.Box3Helper(box, 0xffff00);
                    entitiesInRoom[change.path.id].add(helper);
                    entitiesInRoom[change.path.id].boxHelper = helper


                }
                else {

                    const asset = change.value.AssetsComponent
                    let el;
                    if (asset) {
                        const assetEl = parseHTML(` <a-asset-item id="${asset.id}" src="${asset.src}" animation-mixer="clip: *"></a-asset-item>`)
                        sceneEl.append(assetEl)

                        el = createEntityHTML(`#${asset.id}`, "asset")
                        sceneEl.append(el)
                        window['oo'] = { assetEl, el }
                    }
                    else {
                        el = change.value.TemplateComponent ? createEntityFromData(change.value.TemplateComponent.data) : createEntity()
                        sceneEl.append(el)


                    }

                    const graphics = el.object3D
                    //  graphics.material.color.setHex(color)

                    // have timeout so that lerp later does work as intended
                    setTimeout(() => {

                        if (change.value.BaseProperties3D)
                            graphics.position.copy(change.value.BaseProperties3D.position);



                        // FIXME Dimensions
                        change.value.dimensions = { x: 1, y: 1, z: 1 }

                        graphics.scale.copy(change.value.dimensions)


                    }, 1)

                    entitiesInRoom[change.path.id] = graphics;



                    //bounding box
                    var box = new THREE.Box3();
                    //box.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3().copy(change.value.dimensions));
                    box.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));

                    var helper = new THREE.Box3Helper(box, 0xffff00);
                    entitiesInRoom[change.path.id].add(helper);
                    entitiesInRoom[change.path.id].boxHelper = helper


                }



                entitiesInRoom[change.path.id].el.append(parseHTML(`<a-text position="0 2 0" color="${'#' + color.toString(16)}" value="${change.value.name}: ${change.path.id.substring(0, 5)}"></a-text>`))



            } else if (change.operation === "remove") {

                let o = entitiesInRoom[change.path.id]


                if (o.el)
                    o.el.parentNode.removeChild(o.el);

                this.scene.remove(o);
                if (o.geometry)
                    o.geometry.dispose();
                if (o.material)
                    o.material.dispose();
                delete entitiesInRoom[change.path.id];
            }


        });


        room.listen("entities/:id/BaseProperties3D/position/x", (change: DataChange) => {
            const isCurrentPlayer = change.path.id === room.sessionId
            const el = entitiesInRoom[change.path.id]
            if (isCurrentPlayer && el) {
                //  this.currentPlayerEntity = el.object3D;

                // FIXME
                // @ts-ignore
                document.querySelector("[camera]").object3D.position.x = change.value
                //  console.log("change cam", change.value)
            }

        })

        room.listen("entities/:id/BaseProperties3D/position/y", (change: DataChange) => {
            const isCurrentPlayer = change.path.id === room.sessionId
            const el = entitiesInRoom[change.path.id]
            if (isCurrentPlayer && el) {
                //  this.currentPlayerEntity = el.object3D;

                // FIXME
                // @ts-ignore
                document.querySelector("[camera]").object3D.position.y = change.value
                //  console.log("change cam", change.value)
            }

        })

        room.listen("entities/:id/BaseProperties3D/position/z", (change: DataChange) => {
            const isCurrentPlayer = change.path.id === room.sessionId
            const el = entitiesInRoom[change.path.id]
            if (isCurrentPlayer && el) {
                //  this.currentPlayerEntity = el.object3D;

                // FIXME
                // @ts-ignore
                document.querySelector("[camera]").object3D.position.z = change.value
                //  console.log("change cam", change.value)
            }

        })




        room.listen("entities/:id/PhysicsBody/collisions/:pos", (change: DataChange) => {
            //console.log("entities/:id/PhysicsBody", change)
            const el = entitiesInRoom[change.path.id]


            // const hasCollisions = change.value.collisions.length != 0



            if (!el.boxHelper._origColor) el.boxHelper._origColor = el.boxHelper.material.color.clone()

            if (change.operation == "add")
                el.boxHelper.material.color.setHex(0xff0000);
            else
                el.boxHelper.material.color.set(el.boxHelper._origColor);

        })

        /*  room.listen("entities/:id/ProximityComponent/entries/:pos", (change: DataChange) => {
              // const color = (change.value.distance<4) ? 0xff0000 : 0xFFFF0B;
              const bVisible = change.value.distance < 4
  
              console.log("entities/:id/ProximityComponent", change)
             
              const el = entitiesInRoom[change.value.id]
              console.log(el,bVisible)
              el.visible = bVisible
  
          });*/




    }

    joinChat(name) {

        const newRoom = this.client.join(name);
        newRoom.onJoin.add(() => {
            console.log("connected to chat ", name, newRoom)


            this.activeChat = newRoom


            this.activeChat.listen("participants/:id", (change: DataChange) => {

                if (change.operation === "add") {

                    (document.querySelector("#chat") as any).__vue__.participants.push(change.value)

                }

            })

            this.activeChat.listen("messages/:id", (change: DataChange) => {
                // console.log("DataChange chat:", change)

                if (change.operation === "add") {

                    if (this.activeChat.sessionId == change.value.author)
                        change.value.author = "me";

                    (document.querySelector("#chat") as any).__vue__.messageList.push(change.value)

                }

            })

        })
    }


    joinRoom(name, color?, position?) {

        const newRoom = this.client.join(name);

        const regionEl = createRegion(color)


        console.log("initialize room ", name)
        newRoom.onJoin.add(() => {
            console.log("connected to room ", name, newRoom)

            this.sceneEl.append(regionEl)


            this.initializeRoom(newRoom, regionEl)
            this.activeRoom = newRoom
            this.connectedRooms.push(newRoom as any)

            this.interpolation = true;


        })


        let roomInited = false
        newRoom.onStateChange.add(() => {
            // console.log("state changed room ", name ,newRoom.state) 
            window['StateChange'] = newRoom.state

            regionEl.setAttribute("position", `${newRoom.state.position.x} ${newRoom.state.position.y} ${newRoom.state.position.z} `)

            if (newRoom.state.data)
                if (!roomInited) {
                    regionEl.append(parseHTML(newRoom.state.data))

                    roomInited = true
                }

            if (newRoom.state.boundingBox)
                if (!roomInited) {
                    const bb = new THREE.Box3()
                    bb.copy(newRoom.state.boundingBox)

                    var helper = new THREE.Box3Helper(bb, 0xffff00);

                    regionEl.object3D.add(helper)

                    roomInited = true
                }



        })


    }



    set interpolation(bool: boolean) {

        const entitiesInRoom = this.roomEntitiesMap[this.activeRoom.sessionId]

        this._interpolation = bool;

        if (this._interpolation) {
            this.activeRoom.removeListener(this._axisListener);
            this.loop(this.activeRoom);

        } /* else {
            // update entities position directly when they arrive
            this._axisListener = this.activeRoom.listen("entities/:id/:axis", (change: DataChange) => {
                entitiesInRoom[change.path.id][change.path.axis] = change.value;
            }, true);
        }*/
    }

    loop(room) {


        const entitiesInRoom = this.roomEntitiesMap[room.sessionId]




        for (let id in entitiesInRoom) {

            const entity = entitiesInRoom[id]
            const new_entity = room.state.entities[id]

            if (!new_entity.BaseProperties3D) break

            //  console.log("entitiesInRoom",new_entity,!new_entity.BaseProperties3D)


            const newPosition = new_entity.BaseProperties3D.position
            const newRotation = new_entity.BaseProperties3D.rotation

            entity.position.x = lerp(entity.position.x, newPosition.x, 0.2);
            entity.position.y = lerp(entity.position.y, newPosition.y, 0.2);
            entity.position.z = lerp(entity.position.z, newPosition.z, 0.2);

            /*
            entity.position.x =newPosition.x
            entity.position.y = newPosition.y
            entity.position.z = newPosition.z
            */


            entity.rotation.x = newRotation.x// lerp(entity.rotation.x, newRotation.x, 0.2);
            entity.rotation.y = newRotation.y + Math.PI// lerp(entity.rotation.y, newRotation.y, 0.2);
            entity.rotation.z = newRotation.z //lerp(entity.rotation.z, newRotation.z, 0.2);


            //  entity.scale.set(new_entity.radius, new_entity.radius, new_entity.radius)


        }

        // continue looping if interpolation is still enabled.
        if (this._interpolation) {
            requestAnimationFrame(() => this.loop(room));
        }
    }


    sendToChatRoom(message) {


        this.activeChat.send([ChatMessageTypes.send, message]);

    }

}



