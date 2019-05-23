<template>
  <a-entity>
    <a-plane
      visible="true"
      id="m-main-menu1"
      gui-border
      click-drag
      compass
      position="0 0.4 -1"
      scale="1 1 1"
      height="0.02"
      width="0.2"
      src="#compass-texture"
      material="transparent:true;opacity:0.7;repeat:0.25 1"
    >
      <a-entity
        class="the-world-map"
        position="0 -.1 0"
        scale="0.02 0.02 0.02"
        height="0.2"
        width="0.2"
        rotation="0 0 90"
      ></a-entity>
      <a-text
        value="Player Online 1"
        position="-0.95 .05 0"
        width="0.6"
        font="/assets/fonts/Federation TNG Title.fnt"
        color="#6a5acd"
      ></a-text>

      <a-text :value="text" scale="1 1 1" position="0 0 0"></a-text>
    </a-plane>

    <a-hud id="mainHUD" aspect="16 9" hud-raycaster>
      <!--  <a-plane visible="true"  gui-border click-drag compassposition="0 0.4 -1" scale="1 1 1"
     height="0.02" width="0.2" src="#compass-texture" material="transparent:true;opacity:0.7;repeat:0.25 1">
       <a-entity class="the-world-map" position="0 -.1 0" scale="0.02 0.02 0.02" height="0.2" width="0.2"
         rotation="0 0 90"></a-entity>

         <a-box
         color="red" position="0 0 -10">
         </a-box>
       <a-text class="player-count" value="Player Online 1" position="-0.95 .05 0" width=".6"></a-text>

     </a-plane>
      -->
    </a-hud>
  </a-entity>
</template>



<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class App extends Vue {

  text="Hello OMFG"

  mounted () {
    this.greet()
  }

  
  // method
  greet () {
    alert('greeting: ')
  }
}
</script>