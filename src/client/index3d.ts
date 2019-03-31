import { Application3D } from "./Application3D";

document.querySelector('a-scene').addEventListener('loaded', function (e) {

  //@ts-ignore
    const app = new Application3D(e.target);
    app.interpolation = true;


})
