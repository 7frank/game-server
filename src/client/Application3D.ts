import * as PIXI from "pixi.js";
import * as Viewport from "pixi-viewport";
import { Client, DataChange } from "colyseus.js";
import { State } from "../server/rooms/physics/State"
import { Room } from "colyseus";
import { create } from "domain";
import { MessageTypes } from "../common/types";



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

    _axisListener: any;
    _interpolation: boolean;

    constructor(sceneEl) {
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

                this.room.send([MessageTypes.playerRotate,  { x, y, z }]);
            }
        });

        camera.addEventListener('positionChanged', (evt) => {
            if (this.currentPlayerEntity) {

                this.room.send([MessageTypes.playerMove,evt.detail]);
            }
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

                const graphics = createEntity()
                graphics.material.color.setHex(color)

                graphics.position.copy(change.value.position);
                this.scene.add(graphics);

                this.entities[change.path.id] = graphics;

                // detecting current user
                if (isCurrentPlayer) {
                    this.currentPlayerEntity = graphics;
                    // this.viewport.follow(this.currentPlayerEntity);
                }

            } else if (change.operation === "remove") {
                this.scene.removeChild(this.entities[change.path.id]);
                this.entities[change.path.id].destroy();
                delete this.entities[change.path.id];
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
    var material = new THREE.MeshStandardMaterial({ color: "#433F81" });
    var cube = new THREE.Mesh(geometry, material);
    return cube
}