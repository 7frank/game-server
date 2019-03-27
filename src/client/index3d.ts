import { Application3D,init3DScene } from "./Application3D";


document.querySelector('a-scene').addEventListener('loaded', function (e) {

  console.log("loaded",e)
  
  //@ts-ignore
    const app = new Application3D(e.target);
    app.interpolation = true;


})
