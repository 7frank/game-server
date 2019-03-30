import * as PIXI from "pixi.js";
import * as Viewport from "pixi-viewport";
import { Client, DataChange } from "colyseus.js";
import { State } from "../server/rooms/physics/State"
import { Room } from "colyseus";
import { create } from "domain";
import { MessageTypes } from "../common/types";
import { Hotkeys } from "@nk11/keyboard-interactions";


// @ts-ignore
const THREE = window.THREE

const ENDPOINT = (process.env.NODE_ENV === "development")
    ? "ws://localhost:8080"
    : "wss://colyseus-pixijs-boilerplate.herokuapp.com";

const WORLD_SIZE = 20;

export const lerp = (a: number, b: number, t: number) => (b - a) * t + a




export class Application3D {
    entities: { [id: string]: any } = {};
    currentPlayerEntity: any;//PIXI.Graphics;

    client = new Client(ENDPOINT);
    room = this.client.join("aframe-region-1");

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


        console.log(sceneEl)
        var camera = sceneEl.camera.el;
        camera.addEventListener('rotationChanged', (evt) => {
            if (this.currentPlayerEntity) {

                let { x, y, z } = evt.detail;
                x = x / 180 * Math.PI
                y = y / 180 * Math.PI
                z = z / 180 * Math.PI

                this.room.send([MessageTypes.playerRotate, { x, y, z }]);
            }
        });

        camera.addEventListener('positionChanged', (evt) => {
            if (this.currentPlayerEntity) {

                this.room.send([MessageTypes.playerMove, evt.detail]);
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


        let jumpCurve

        Hotkeys().on(MessageTypes.playerJump, (evt) => {
            console.log("jump on")
            if (this.currentPlayerEntity) {
                /*   if (!jumpCurve)
                  {
                      jumpCurve= createJumpCurve(this.currentPlayerEntity)
      
                  }
               */


                // TODO jump should block all move commands while jumping
                //this.room.send([MessageTypes.playerJump, {}]);


                let pos = this.currentPlayerEntity.position
                pos.y += 0.05
                this.room.send([MessageTypes.playerMove, pos]);
            }
        }, function () {
            console.log("jump off")
        });







        this.interpolation = true;
        this.initialize();
    }

    initialize() {
        // add / removal of entities
        this.room.listen("entities/:id", (change: DataChange) => {
            if (change.operation === "add") {
                const color = (change.value.type == "kinematic")
                    ? 0xff0000
                    : 0xFFFF0B;

                const isCurrentPlayer = change.path.id === this.room.sessionId

                const isPlayerCharacter= change.value.type == "kinematic"

                /*   const color = (isCurrentPlayer)
                   ? 0xff0000
                   : 0xFFFF0B;

                  */

                /*  const graphics = new PIXI.Graphics();
                  graphics.lineStyle(0);
                  graphics.beginFill(color, 0.5);
                  graphics.drawCircle(0, 0, change.value.radius);
                  graphics.endFill();
  */

             


                if (isPlayerCharacter)
                {


                    //FIXME using models will break phyics sync
                    const el=createEntityHTML()
                    this.sceneEl.append(el)
                   
                  
                    el.addEventListener('model-loaded',()=>{
    
                      //  this.scene.add(el.object3D);
                      this.entities[change.path.id]=el.object3D

                        // detecting current user
                        if (isCurrentPlayer) {
                            this.currentPlayerEntity =   el.object3D;
                            el.object3D.visible = false          
                        
                        //    this.currentPlayerEntity = graphics

                        }

                          
                    })

                

                }
                else
                {

                    const graphics = createEntity()
                    graphics.material.color.setHex(color)
    
                    graphics.position.copy(change.value.position);
                    this.scene.add(graphics);
    
                    //  <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
         
    
    
                    this.entities[change.path.id] = graphics;


                }

             

            } else if (change.operation === "remove") {

                console.warn("TODO remove elements")
                /*
                                this.scene.removeChild(this.entities[change.path.id]);
                                this.entities[change.path.id].destroy();
                                delete this.entities[change.path.id];*/
            }
        });

        this.room.listen("entities/:id/radius", (change: DataChange) => {
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

        });
    }

    set interpolation(bool: boolean) {
        this._interpolation = bool;

        if (this._interpolation) {
            this.room.removeListener(this._axisListener);
            this.loop();

        } else {
            // update entities position directly when they arrive
            this._axisListener = this.room.listen("entities/:id/:axis", (change: DataChange) => {
                this.entities[change.path.id][change.path.axis] = change.value;
            }, true);
        }
    }

    loop() {
        for (let id in this.entities) {
            const entity = this.entities[id]
            const new_entity = this.room.state.entities[id]


            entity.position.x = lerp(entity.position.x, new_entity.position.x, 0.2);
            entity.position.y = lerp(entity.position.y, new_entity.position.y, 0.2);
            entity.position.z = lerp(entity.position.z, new_entity.position.z, 0.2);



            entity.rotation.x = new_entity.rotation.x// lerp(entity.rotation.x, new_entity.rotation.x, 0.2);
            entity.rotation.y = new_entity.rotation.y// lerp(entity.rotation.y, new_entity.rotation.y, 0.2);
            entity.rotation.z = new_entity.rotation.z //lerp(entity.rotation.z, new_entity.rotation.z, 0.2);


            entity.scale.set(new_entity.radius, new_entity.radius, new_entity.radius)


        }

        // continue looping if interpolation is still enabled.
        if (this._interpolation) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }
}



export
    function init3DScene(scene) {



    //   var scene = new THREE.Scene();

    // Create a basic perspective camera
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 40;

    // Create a renderer with Antialiasing
    var renderer = new THREE.WebGLRenderer({ antialias: true });

    // Configure renderer clear color
    renderer.setClearColor("#000000");

    // Configure renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Append Renderer to DOM
    document.body.appendChild(renderer.domElement);

    // ------------------------------------------------
    // FUN STARTS HERE
    // ------------------------------------------------

    const cube: any = createEntity()

    // Add cube to Scene
    scene.add(cube);

    // Render Loop
    var render = function () {
        requestAnimationFrame(render);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        // Render the scene
        renderer.render(scene, camera);
    };

    render();

    return scene

}


function createEntity() {

    // Create a Cube Mesh with basic material
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshStandardMaterial({ color: "#433F81",transparent:true, opacity:0.5 });
    var cube = new THREE.Mesh(geometry, material);
    return cube
}

function createEntityHTML(selector = "#tree",text="Hello") {

    var parseHTML = require('parsehtml');

    var htmlSnippet = `<a-entity>
   
    <a-text position="0 4 0" scale="3 3 3" color="black" align='center' value=" ${text}"></a-text>
    <a-entity  gltf-model="${selector}"></a-entity>
    </a-entity>`,
        html = parseHTML(htmlSnippet);

    return html

}


