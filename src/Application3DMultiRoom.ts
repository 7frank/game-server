import * as PIXI from "pixi.js";
import * as Viewport from "pixi-viewport";
import { Client, DataChange } from "colyseus.js";
import { State } from "../server/rooms/physics/State"
import { Room } from "colyseus";
import { create } from "domain";
import { MessageTypes } from "../common/types";
import { Hotkeys } from "@nk11/keyboard-interactions";
import { FPSCtrl } from "./FPSCtrl";

const PLAYER_SIZE=1.8
// @ts-ignore
const THREE = window.THREE

const ENDPOINT = (process.env.NODE_ENV === "development")
    ? "ws://localhost:8080"
    : "wss://colyseus-pixijs-boilerplate.herokuapp.com";

const WORLD_SIZE = 20;

export const lerp = (a: number, b: number, t: number) => (b - a) * t + a





/**
 * joining & leaving rooms (switching)
 * a "world" serverside-room would have to track the player position and connect the player to each room
 * exclude hierarchies for simplicity
 * 
 * 
 */

export class Application3D {
    entities:{[roomName:string]: { [id: string]: any }} = {
        "aframe-region-1":{},
        "aframe-region-2":{}
    };
    currentPlayerEntity: any;//PIXI.Graphics;

    client = new Client(ENDPOINT);
    
    rooms =[ this.client.join("aframe-region-1"),this.client.join("aframe-region-2")];
    playerActiveRoom=this.rooms[0]


    viewport: Viewport;


    scene: any;
    sceneEl: any
    _axisListener: any;
    _interpolation: boolean;

    constructor(sceneEl) {
        this.sceneEl = sceneEl
        this.scene = sceneEl.object3D// init3DScene(scene)

        /*   super({
               width: window.innerWidth,
               height: window.innerHeight,
               backgroundColor: 0x0c0c0c
           });
   
           this.viewport = new Viewport({
               screenWidth: window.innerWidth,
               screenHeight: window.innerHeight,
               worldWidth: WORLD_SIZE,
               worldHeight: WORLD_SIZE,
           });
   
           // draw boundaries of the world
           const boundaries = new PIXI.Graphics();
           boundaries.beginFill(0x000000);
           boundaries.drawRoundedRect(0, 0, WORLD_SIZE, WORLD_SIZE, 30);
           this.viewport.addChild(boundaries);
   
           // add viewport to stage
           this.stage.addChild(this.viewport);
   
           this.initialize();
           this.interpolation = false;
   
           this.viewport.on("mousemove", (e) => {
               if (this.currentPlayerEntity) {
                   const point = this.viewport.toLocal(e.data.global);
                   this.room.send(['mouse', { x: point.x, y: point.y }]);
               }
           });
   */

        /*  document.addEventListener("mousemove", (evt:any) => {
            console.log("mouse",evt.detail)
                this.room.send(['mouse', { x: 1, y:1 }]);
         
        });*/

 
    
        var camera = sceneEl.camera.el;
        camera.addEventListener('rotationChanged', (evt) => {
            if (this.currentPlayerEntity) {

                let { x, y, z } = evt.detail;
                x = x / 180 * Math.PI
                y = y / 180 * Math.PI
                z = z / 180 * Math.PI

                this.playerActiveRoom.send([MessageTypes.playerRotate, { x, y, z }]);
            }
        });

        camera.addEventListener('positionChanged', (evt) => {
            if (this.currentPlayerEntity) {

                this.playerActiveRoom.send([MessageTypes.playerMove, evt.detail]);
            }
        });



        // @ts-ignore
        Hotkeys.register(MessageTypes.playerJump, 'space', {
            // category: 'HUD',
            target: this.sceneEl
        });

        // TODO use animation lib to create the path via functions
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


        // FIXME implement server side phyiscs based jumping and see where that leads us
        // https://github.com/chandlerprall/Physijs/issues/147

        let jumpCurve
        let downForce=0
        let jumping=false
         const jumpScript= new FPSCtrl(50)
         jumpScript.start()
        jumpScript.on('frame',()=>{

    /*   if (!jumpCurve)
                     {
                         jumpCurve= createJumpCurve(this.currentPlayerEntity)
         
                     }
                  */
     
   
                   // TODO jump should block all move commands while jumping
                   //this.room.send([MessageTypes.playerJump, {}]);
   
                   var camera = sceneEl.camera.el.object3D;
                   let pos = camera.position//this.currentPlayerEntity.position
                        let posBefore=pos.clone()

                   if (jumping)
                   pos.y += 0.06
                    else if (pos.y>PLAYER_SIZE)
                    pos.y -= (downForce+=0.01)

                    if (pos.distanceTo(posBefore)>0.05)
                    {
                    this.playerActiveRoom.send([MessageTypes.playerMove, pos]);
                            console.log("jumping")
                    }
          })

        
        Hotkeys().on(MessageTypes.playerJump, (evt) => {
          
            if (this.currentPlayerEntity&& !jumping) {
              // console.log("jump on")
              //  jumpScript.start()
                jumping=true
                downForce=0
            }
        }, function () {
          //  jumpScript.stop()
          //  console.log("jump off")
            jumping=false
        });







        this.interpolation = true;
        this.initialize();
    }

    initialize() {
        // add / removal of entities
        this.rooms.forEach((room,idid) => room.listen("entities/:id", (change: DataChange) => {
            if (change.operation === "add") {
                const color = (change.value.type == "kinematic")
                    ? 0xff0000
                    : idid?0xFFFF0B:0xff0000;
 
                const isCurrentPlayer = change.path.id === room.sessionId

                const isPlayerCharacter= change.value.type == "kinematic"

  
                if (isPlayerCharacter)
                {


                    //FIXME using models will break phyics sync
                    const el=createEntityHTML("#steve","Player "+room.sessionId)
                    this.sceneEl.append(el)
                    console.log("Player joined:"+room.sessionId)
                    this.entities[room.name][change.path.id]=el.object3D
                  
                    el.object3D.position.copy(change.value.position);

                    if (isCurrentPlayer) {
                        this.currentPlayerEntity =   el.object3D;
                        el.object3D.visible = false          
                       
                    }

                    el.addEventListener('model-loaded',()=>{
    
                    })

                 

                

                } 
                else
                {
                    const el=createEntity()
                    this.sceneEl.append(el)
                    const graphics = el.object3D
                  //  graphics.material.color.setHex(color)
                    graphics.position.copy(change.value.position);
                   // this.scene.add(graphics);
    
                    //  <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
         
    

                    this.entities[room.name][change.path.id] = graphics;


                }


                //bounding box
                var box = new THREE.Box3();
            box.setFromCenterAndSize( new THREE.Vector3( 0, -PLAYER_SIZE/2, 0 ), new THREE.Vector3().copy(change.value.dimensions) );

            var helper = new THREE.Box3Helper( box, 0xffff00 );
            this.entities[room.name][change.path.id].add( helper );

             

            } else if (change.operation === "remove") {

                                let o=this.entities[room.name][change.path.id]
        
                                this.scene.remove(o);
                                if (o.geometry)
                                o.geometry.dispose();
                                if (o.material)
                                o.material.dispose();
                                delete this.entities[room.name][change.path.id];
            }
        }));

        this.rooms.forEach(room=> room.listen("entities/:id/radius", (change: DataChange) => {
            const color = (change.value < 4) ? 0xff0000 : 0xFFFF0B;

            console.log("entities/:id/radius", change)
            /*
            const graphics = this.entities[change.path.id];
            graphics.clear();
            graphics.lineStyle(0);
            graphics.beginFill(color, 0.5);
            graphics.drawCircle(0, 0, change.value);
            graphics.endFill();
        */
            // if (this.currentPlayerEntity) {
            //     // console.log(this.currentPlayerEntity.width);
            //     // console.log(this.currentPlayerEntity.width / 20);
            //     this.viewport.scale.x = lerp(this.viewport.scale.x, this.currentPlayerEntity.width / 20, 0.2)
            //     this.viewport.scale.y = lerp(this.viewport.scale.y, this.currentPlayerEntity.width / 20, 0.2)
            // }

        }));
    }

    set interpolation(bool: boolean) {
        this._interpolation = bool;

        if (this._interpolation) {
            this.playerActiveRoom.removeListener(this._axisListener);
            this.loop();

        } else {
            // update entities position directly when they arrive
            this._axisListener = this.playerActiveRoom.listen("entities/:id/:axis", (change: DataChange) => {
                this.entities[this.playerActiveRoom.name][change.path.id][change.path.axis] = change.value;
            }, true);
        }
    }  

    loop() {

            this.rooms.forEach((room,idid)=> {

        for (let id in this.entities[room.name]) {
            const entity = this.entities[room.name][id]
            const new_entity = room.state.entities[id]


            entity.position.x = lerp(entity.position.x, new_entity.position.x, 0.2)+(idid*10);
            entity.position.y = lerp(entity.position.y, new_entity.position.y, 0.2);
            entity.position.z = lerp(entity.position.z, new_entity.position.z, 0.2);



            entity.rotation.x = new_entity.rotation.x// lerp(entity.rotation.x, new_entity.rotation.x, 0.2);
            entity.rotation.y = new_entity.rotation.y+Math.PI// lerp(entity.rotation.y, new_entity.rotation.y, 0.2);
            entity.rotation.z = new_entity.rotation.z //lerp(entity.rotation.z, new_entity.rotation.z, 0.2);


            entity.scale.set(new_entity.radius, new_entity.radius, new_entity.radius)


        }


    })

        // continue looping if interpolation is still enabled.
        if (this._interpolation) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }
}



var parseHTML = require('parsehtml');

function createEntity() {

    // Create a Cube Mesh with basic material
    /*var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshStandardMaterial({ color: "#433F81",transparent:true, opacity:0.5 });
    var cube = new THREE.Mesh(geometry, material);
    return cube
*/

   const el= parseHTML(`<a-box  color="#433F81"  shadow="cast: true;receive: true"></a-box>`)
   
return el
}

function createEntityHTML(selector = "#tree",text="Hello") {


    var htmlSnippet = `<a-entity   >
    
    <a-text position="0 2.5 0" scale="3 3 3" color="black" align='center' value=" ${text}"></a-text>
    <a-entity position="0 ${-PLAYER_SIZE} 0" gltf-model="${selector}" shadow="cast: true;receive: true"></a-entity>
    </a-entity>`,
        html = parseHTML(htmlSnippet);
  
    return html
          
}  
  
