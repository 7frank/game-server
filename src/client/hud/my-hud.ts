import Vue from 'vue/dist/vue.esm';
import { FPSCtrl } from '../FPSCtrl';
Vue.component('my-hud', {
  template: `
    <a-entity >
    <a-plane
      position="0 0 -1"
      
      click-drag
      material="transparent:true;opacity:0.1;repeat:0.25 1"
    >
      <a-text
      :value="text" 
        position="-.45 .45 0"
        width="0.6"
        font="/assets/fonts/Federation TNG Title.fnt"
        color="#6a5acd"
      ></a-text>
  
      <a-plane
        v-for="(item, index) in inventory"
        :position="'-.45 '+(.35-index/10)+ ' 0'"
        color="#CCC" height= 0.05; width= 0.19
        @interaction-pick="onClick(item)"
        >
          <a-text
          :value="item.title+' '+item.amount" 
          width="0.6"
          font="/assets/fonts/Federation TNG Title.fnt"
          color="#6a5acd"
          align="center"
          ></a-text>
      </a-plane>

        <a-entity position=".35 .35 .35" scale=".15 .15 .15">
            <a-ring color="teal" radius-inner=".8" radius-outer="1" :theta-length="shield.current/shield.maximum*360"></a-ring>
            <a-ring color="red" radius-inner=".6" radius-outer=".81" :theta-length="life.current/life.maximum*360"></a-ring>

            <a-text
            :value="'health: '+life.current+' / '+life.maximum" 
            position="0 .2 0"
            scale=".5 .5 .5"
            font="/assets/fonts/Federation TNG Title.fnt"
            color="red"
            align="center"
            ></a-text>
            <a-text
            :value="'shield: '+shield.current+' / '+shield.maximum" 
            position="0 -.2 0"
            scale=".5 .5 .5"
            font="/assets/fonts/Federation TNG Title.fnt"
            color="teal"
            align="center"
            ></a-text>

        </a-entity>
       </a-plane>
  
    <a-hud id="mainHUD" aspect="16 9" hud-raycaster>
      <!-- FIXME #1 above code should be inside here, also change hud-raycaster back -->
    </a-hud>
  </a-entity>
  `,


  name: 'my-hud',
  data() {
    return {
      text: "Welcome, the HUD is still in development",
      inventory: [
        { title: "hello", amount: 0 },
        { title: "world", amount: 0 },
        { title: "vue", amount: 0 },
        { title: "threejs", amount: 0 }
      ],
      life: { current: 70, maximum: 100 },
      shield: { current: 70, maximum: 100 }

    }
  },
  methods: {
    onClick: function (e) {
      e.amount++
      console.log("clicky clicky", e)

    // TODO use animation lib
    //  new FPSCtrl(30).start().on("frame",()=>{
    //  })


    }
  }

})



