<template>

<a-scene renderer-listener cursor-focus background="color: #eee"
    gridhelper="size:100;divisions:100;colorCenterLine:red;colorGrid:grey;">
    <a-assets>
      <a-asset-item id="steve" src="/assets/characters/minecraft-steve.glb" animation-mixer="clip: *"></a-asset-item>
      <a-asset-item id="jasper" src="/assets/characters/jasper.glb" animation-mixer="clip: *"></a-asset-item>
      <a-asset-item id="claire" src="/assets/characters/claire.glb" animation-mixer="clip: *"></a-asset-item>
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

    </a-entity>




    <a-entity light="type:directional; castShadow:true;" position="0 20 0"></a-entity>
    <a-entity light="type:ambient;"></a-entity>

    <a-entity position="0 0 0" sound="src: url(/assets/audio/8-Bit Heroes/Daydream Anatomy - 8-Bit Heroes - 06 Dragon Slayer.mp3); autoplay: true;positional:false;volume:.6;"></a-entity>


  </a-scene>


</template>

<script lang="ts">
    import Vue from 'vue'
    import Component from 'vue-class-component'
   // import Hello from "./components/hello.vue"

    @Component({
     //   components: {Hello}
    })

    export default class App extends Vue {
        created() {
            console.log("created the root instance")
        }
    }
</script>