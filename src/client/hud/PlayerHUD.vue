<template>
    <a-entity id="playerHUD" >
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
  
  <a-text v-if="respawnTimer>0"
        :value="'respawn in '+respawnTimer" 
        position="-.35 .35 0"
        width="1"
        font="/assets/fonts/Federation TNG Title.fnt"
        color="red"
      ></a-text>
  

      <a-plane
        v-for="(item, index) in inventory"
        :position="'-.45 '+(.35-index/10)+ ' 0'"
        color="#CCC" height= 0.05; width= 0.19
        @interaction-pick="onClick(item)"
        @mouseenter="showTooltip(item)"
        @mouseleave="showTooltip(false)"
        >
          <a-text
          :value="item.title+' '+item.amount" 
          width="0.6"
          font="/assets/fonts/Federation TNG Title.fnt"
          color="#6a5acd"
          align="center"
          ></a-text>
      </a-plane>


      <a-plane
        v-if="selection"
        position="0 0  0"
        color="#CCC" height= 0.5; width= 0.39
        material="transparent:true;opacity:0.5;"
        >
        <a-text
        :value="selection.title+' '+selection.amount" 
        width="0.6"
        font="/assets/fonts/Federation TNG Title.fnt"
        color="#6a5acd"
        align="center"
        ></a-text>
          <a-text
          position="0 -.1 0"
          :value="'Description'+selection.description" 
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
</template>


<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';

    import { FPSCtrl } from '../FPSCtrl';

    //TODO proper imports
    import './hud-imports'

    @Component
    export default class HUD extends Vue {
      text= "Welcome, the HUD is still in development";
      inventory= [
        { title: "hello", amount: 0 },
        { title: "world", amount: 0 },
        { title: "vue", amount: 0 },
        { title: "threejs", amount: 0 }
      ];
      life= { current: 70, maximum: 100 };
      shield= { current: 70, maximum: 100 }
      selection=false 

      respawnTimer=0


      onClick (e) {
        e.amount++
        console.log("clicky clicky", e)
  
      // TODO use animation lib
      //  new FPSCtrl(30).start().on("frame",()=>{
      //  })
  
  
      }

      showTooltip(item)
      {
          this.selection=item
  
  
      }


      startRespawnScreen(spawnTimestamp)
      {
        const script= new FPSCtrl(30).start();
        script.on("frame",()=>{

          this.respawnTimer=(spawnTimestamp-Date.now())/1000;
          if (this.respawnTimer<=0)
          {
            this.respawnTimer=0;
            script.stop();
          }
        });
      }
    }
</script>



