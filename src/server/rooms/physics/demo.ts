const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;
const Ammo = NodePhysijs.Ammo;
const Physijs = NodePhysijs.Physijs(THREE, Ammo);



export function createDemo() {

    /////////////////
    // game

    var initScene, render, renderer, scene, camera, box_falling;

    initScene = function () {

       // scene = new Physijs.Scene({ fixedTimeStep: 1 / 30 });
        scene = new Physijs.Scene();

        const ground = new Physijs.PlaneMesh(
            new THREE.PlaneGeometry(1e6, 1e6),
            new THREE.MeshBasicMaterial({ color: 0x888888 })
        );
        ground.rotation.x = -Math.PI / 2
        ground.position.y = 0;
        scene.add(ground);
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
        addEntity: (position,mass?: number) => {

            const box_falling = new Physijs.BoxMesh(
                new THREE.CubeGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial({ color: 0x888888 }),
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
