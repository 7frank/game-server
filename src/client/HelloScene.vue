<template>

  <a-scene renderer-listener cursor-focus background="color: #eee"
    gridhelper="size:100;divisions:100;colorCenterLine:red;colorGrid:grey;"
    @click="loadAudio"
    
    >
    <a-assets>
      <a-asset-item id="steve" src="/assets/characters/minecraft-steve.glb" animation-mixer="clip: *"></a-asset-item>
      <a-asset-item id="jasper" src="/assets/characters/jasper.glb" animation-mixer="clip: *"></a-asset-item>
      <a-asset-item id="claire" src="/assets/characters/claire.glb" animation-mixer="clip: *"></a-asset-item>


    <!--  <a-sound   v-for="(item, index) in assets.audio" :id="generateID(item,index)" :src="'src: url('+item.src+')'" :autoplay="item.autoplay" :volume="item.volume" ::positional="item.positional" ></a-sound>
-->
      <a-entity v-for="(item, index) in assets.audio"  :id="generateID(item,index)"  :sound="soundSettings(item)"></a-entity>



     <!--  <a-sound class="sound-ball-bounce" src="src: url(assets/audio/interaction/rubber_ball_bounce_dirt_01.mp3)" autoplay="false" volume=1 positional=false></a-sound>
      <a-sound class="bullet-impact" src="src: url(assets/audio/interaction/Bullet_Impact_Metal_Hard_Clang.mp3)" autoplay="false" volume=2 positional=false></a-sound>
      <a-sound class="command-error" src="src: url(assets/audio/interaction/hl2-button3.wav)" autoplay="false" volume=1 positional=false></a-sound>
 -->
    </a-assets>


    <a-text value="Bombergirl" font="/assets/fonts/Federation TNG Title.fnt" color="#6a5acd" negate="false"
      scale="4 4 4" position="0 6 0"></a-text>
    <a-text value="- The next Generation -" color="#6a5acd" font="/assets/fonts/Federation TNG Title.fnt" negate="false"
      scale="2 2 2" position="0 5 0"></a-text>

    <a-entity camera="far:20000" position-listener rotation-listener look-controls wasd-controls position="0 1.8 0">

      <a-entity cursor="rayOrigin:mouse"
        raycaster="interval: 50"
        raycaster-listener
        position="0 0 -1"
        geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
        material="color: black; shader: flat">
      </a-entity>

      <PlayerHUD></PlayerHUD>


    </a-entity>




    <a-entity light="type:directional; castShadow:true;" position="0 20 0"></a-entity>
    <a-entity light="type:ambient;"></a-entity>

    <a-entity ref="backgroundMusic" v-if="soundEnabled" position="0 0 0" :sound="ambientSoundSettings()"></a-entity>


  </a-scene>


</template >

  <script lang="ts">
    import Vue from 'vue'
    import Component from 'vue-class-component'
   // TODO
   // import { Vue, Component, Prop,Watch } from 'vue-property-decorator'
    import PlayerHUD from "./hud/PlayerHUD.vue"
    import { DefaultAssets, GameAssets, AFrameAudioTag } from "./MainAssets";

    const uuid = require('uuid/v1');
console.log("uuid",uuid)
    @Component({
      components: {PlayerHUD}
    })

    export default class App extends Vue {


      assets:DefaultAssets=GameAssets;

      generateID(item:AFrameAudioTag,key)
      {
        if (!item.uuid) item.uuid=uuid()

       return item.uuid // TODO generate hash from string or uuid when initializing
      }

      soundEnabled=false;
    
      ambientSoundSettings(){

    const available=[
  "/assets/audio/8-Bit Heroes/Daydream Anatomy - 8-Bit Heroes - 01 Combat.mp3",
  "/assets/audio/8-Bit Heroes/Daydream Anatomy - 8-Bit Heroes - 02 8-Bit Bomber.mp3",
  "/assets/audio/8-Bit Heroes/Daydream Anatomy - 8-Bit Heroes - 03 Nin10day.mp3",
  "/assets/audio/8-Bit Heroes/Daydream Anatomy - 8-Bit Heroes - 04 Struggle.mp3",
  "/assets/audio/8-Bit Heroes/Daydream Anatomy - 8-Bit Heroes - 05 Our Hero's Funeral March.mp3",
  "/assets/audio/8-Bit Heroes/Daydream Anatomy - 8-Bit Heroes - 06 Dragon Slayer.mp3"
    ]
  
    var selected = available[Math.floor(Math.random()*available.length)];
  
  return `src: url(${selected});autoplay: true;positional:false;volume:.6`
  
  }  

  soundSettings(item:AFrameAudioTag){
    return `src: url(${item.src});autoplay: ${item.autoplay};positional:${item.positional};volume:${item.volume};poolSize:3`
  }  
 /**
  * will start playing audio and listen to ended events to start next track 
  * 
  **/ 
 loadAudio()
 {
  
  if (! this.soundEnabled)
  setTimeout(()=>{
   const soundEl= (this.$refs.backgroundMusic as any)
   soundEl.addEventListener('sound-ended',  () =>{
    soundEl.setAttribute("sound",this.ambientSoundSettings())
      });
  },1000);

 this.soundEnabled=true;

 
 }


}
</script>