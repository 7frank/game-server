const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;
const Ammo = NodePhysijs.Ammo;
const Physijs = NodePhysijs.Physijs(THREE, Ammo);



export function createDemo() {

    /////////////////
    // game

    var initScene, render, renderer, scene, camera, box_falling;

    initScene = function () {

        scene = new Physijs.Scene({ fixedTimeStep: 1 / 30 });


        const ground = new Physijs.PlaneMesh(
            new THREE.PlaneGeometry(1e6, 1e6),
            new THREE.MeshBasicMaterial({ color: 0x888888 })
        );
        ground.rotation.x = -Math.PI / 2

        scene.add(ground);



        /*   
           // Box
           box_falling = new Physijs.BoxMesh(
               new THREE.CubeGeometry( 5, 5, 5 ),
               new THREE.MeshBasicMaterial({ color: 0x888888 })
           );
           scene.add( box_falling );
           
           // Box
           var box = new Physijs.BoxMesh(
               new THREE.CubeGeometry( 5, 5, 5 ),
               new THREE.MeshBasicMaterial({ color: 0x880088 }),
               0
           );
           box.position.y = -20;
           scene.add( box );
           */
        //setTimeout(render, 200);
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
        addEntity: (mass?: number) => {

            const box_falling = new Physijs.BoxMesh(
                new THREE.CubeGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial({ color: 0x888888 }),
                mass
            );
            scene.add(box_falling);
            return box_falling
        }
    }



}
