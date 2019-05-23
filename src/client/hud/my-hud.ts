import Vue from 'vue/dist/vue.esm';
Vue.component('my-hud', {
    template: `
    <a-entity >
    <a-plane
      position="0 0 -1"
      gui-border
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
  
  
      <a-text
      v-for="(item, index) in inventory"
      :value="item.name+' '+item.amount" 
        :position="'-.45 '+(.35-index/10)+ ' 0'"
        width="0.6"
        font="/assets/fonts/Federation TNG Title.fnt"
        color="#6a5acd"
        geometry="primitive: plane; height: 0.05; width: 0.19"
        @interaction-pick="onClick(item)"
        align="center"
      ></a-text>
        <a-entity position=".4 .4 0" scale=".1 .1 .1">
            <a-ring color="teal" radius-inner=".8" radius-outer="1" :theta-length="shield.current/shield.maximum*360"></a-ring>
            <a-ring color="red" radius-inner=".6" radius-outer=".8" :theta-length="life.current/life.maximum*360"></a-ring>
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
              {name:"hello",amount:0},
              {name:"world",amount:0},
              {name:"vue",amount:0},
              {name:"threejs",amount:0}
            ],            
            life: { current: 70, maximum: 100 },
            shield: { current: 70, maximum: 100 }

        }
    },
    methods:{
        onClick:function(e){
            e.amount++
            console.log("clicky clicky",e)

        }
    }

})



