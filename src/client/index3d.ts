import { Application3D } from "./Application3D";
import { createViews } from "./chat/chat";
import {IArticle} from "../../../strapi-backend-typescript/@strapi-types"
import {ServerConfig} from '../../../strapi-backend-typescript/@strapi-sdk-typescript/sdk'
const { strapiInstance, models } = new ServerConfig("http://localhost:1337");

document.querySelector('a-scene').addEventListener('loaded', function (e) {

  //@ts-ignore
    const app = new Application3D(e.target);
    window['app']=app


    window['db']={ strapiInstance, models }
   
  //  app.interpolation = true;


  createViews();

  (document.querySelector("#chat") as any).__vue__.$on("chat-message",(e)=> app.sendToChatRoom(e.detail))
  

  
  

})
