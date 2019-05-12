// @ts-ignore
const THREE = window.THREE
/**
 * fbx-model
 *
 * Loader for FBX format. Supports ASCII, but *not* binary, models.
 */
export default {
    dependencies: ['animation-mixer'],
  
    multiple: true,
  
    schema: {
      src: { type: 'asset' },
      name: { default: '' },
      crossorigin: { default: '' }
    },
  
    init: function () {
      this.clip = null;
      this.appendClip = this.appendClip.bind(this);
      this.el.addEventListener('model-loaded', this.appendClip);
    },
  
    remove: function () {
      this.el.removeEventListener('model-loaded', this.appendClip);
    },
  
    update: function () {
      var loader,
          data = this.data;
      if (!data.src) return;
  
      loader = new THREE.FBXLoader();
      if (data.crossorigin) loader.setCrossOrigin(data.crossorigin);
      loader.load(data.src, this.load.bind(this), undefined, function (e) {
        console.error('[fbx-animation] ' + e);
      });
    },
    
    load: function (mesh) {

        const clips=mesh.animations

        console.log("aaa00",clips)
      if (clips.length > 1) {
        console.warn('[fbx-animation] Only 1 animation clip per file is supported.');
      }
      this.clip = clips[0];

      console.log("fbx-animation clips",clips, this.data.name)

      this.clip.name = this.data.name || this.clip.name;
      this.appendClip();
    },
  
    appendClip: function () {
      var el = this.el;
      var mesh = el.getObject3D('mesh')//.children[0];
      console.log("aaa1",mesh,this)
      if (mesh && this.clip) {
        console.log("aaa2")
        mesh.animations = mesh.animations || [];
        mesh.animations.push(this.clip);
        console.log("aaa3",mesh)
        el.emit('animation-loaded', {format: 'fbx', clip: this.clip});
      }
    }
  };