import { getRandomInt } from "../../util";

const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;
const Ammo = NodePhysijs.Ammo;
const Physijs = NodePhysijs.Physijs(THREE, Ammo);



function roomPlanesFromBoundingBox(boundingBox: THREE.Box3) {
    Object.values(boundingBox.min)
    Object.values(boundingBox.max)


    var material = createBasicPhysicsMaterial()
    const planeGeometry = new THREE.PlaneGeometry(1e6, 1e6)

    const planes = []


    const ground = new Physijs.PlaneMesh(
        planeGeometry,
        material
    );
    ground.rotation.x = -Math.PI / 2
    ground.position.y = boundingBox.min.y;

    const top = new Physijs.PlaneMesh(
        planeGeometry,
        material
    );
    top.rotation.x = Math.PI / 2
    top.position.y = boundingBox.max.y;


    const back = new Physijs.PlaneMesh(
        planeGeometry,
        material
    );
    //top.rotation.x = Math.PI / 2
    back.position.z = boundingBox.min.z;

    const front = new Physijs.PlaneMesh(
        planeGeometry,
        material
    );
    front.rotation.y = Math.PI
    front.position.z = boundingBox.max.z;


    const left = new Physijs.PlaneMesh(
        planeGeometry,
        material
    );
    left.rotation.y = Math.PI / 2
    left.position.x = boundingBox.min.x;

    const right = new Physijs.PlaneMesh(
        planeGeometry,
        material
    );
    right.rotation.y = -Math.PI / 2
    right.position.x = boundingBox.max.x;






    planes.push(ground, top, front, back, left, right)


    return planes
}


function createBasicPhysicsMaterial() {

    var friction = 0.8; // high friction
    var restitution = 0.3; // low restitution

    var material = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ color: 0x888888 }),
        friction,
        restitution
    );
    return material

}

export function createDemo(boundingBox) {

    /////////////////
    // game

    var initScene, render, renderer, scene, camera, box_falling;

    initScene = function () {

        // scene = new Physijs.Scene({ fixedTimeStep: 1 / 30 });
        scene = new Physijs.Scene();

        //  setInterval(()=>  scene.setGravity(new THREE.Vector3( getRandomInt(-10,10), getRandomInt(-10,10), getRandomInt(-10,10) )   ),10)



        /*    const ground = new Physijs.PlaneMesh(
                new THREE.PlaneGeometry(1e6, 1e6),
                createBasicPhysicsMaterial()
            );
            ground.rotation.x = -Math.PI / 2
            ground.position.y = 0;
            scene.add(ground);
    */

        roomPlanesFromBoundingBox(boundingBox).forEach(plane => scene.add(plane))


    };



    initScene();



    /*render = function() {
        scene.simulate(); // run physics
        setTimeout( render, 200 );
    };
    */


    return {
        scene,
        update: (timeStep = 1, maxSubSteps = 1) => {

            scene.simulate(timeStep, maxSubSteps);

        },
        addEntity: (position, dimensions = [1, 1, 1], mass?: number) => {


            const material = createBasicPhysicsMaterial()


            const box_falling = new Physijs.BoxMesh(
                new THREE.CubeGeometry(...dimensions),
                material,
                mass
            );


            box_falling.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );


            box_falling.position.copy(position)
            scene.add(box_falling);
            return box_falling
        }
    }



}
