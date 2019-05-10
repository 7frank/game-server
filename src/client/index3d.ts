import { Application3D } from "./Application3D";
//import { createViews } from "./chat/chat";

document.querySelector('a-scene').addEventListener('loaded', function (e) {

  //@ts-ignore
    const app = new Application3D(e.target);
    window['app']=app
  //  app.interpolation = true;


  //createViews()


  

})
