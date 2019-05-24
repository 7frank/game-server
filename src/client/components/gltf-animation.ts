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

        // FIXME support draco
        var dracoLoader = null// this.system.getDRACOLoader();
        this.model = null;
        this.loader = new THREE.GLTFLoader();
        if (dracoLoader) {
            this.loader.setDRACOLoader(dracoLoader);
        }


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
        const el = this.el

        if (data.crossorigin) this.loader.setCrossOrigin(data.crossorigin);

        this.loader.load(data.src, this.load.bind(this), undefined /* onProgress */, function gltfFailed(error) {
            var message = (error && error.message) ? error.message : 'Failed to load glTF model';
            console.warn(message);
            el.emit('animation-error', { format: 'gltf', src: data.src });
        });


    },

    load: function (gltfModel) {


        const mesh = gltfModel.scene || gltfModel.scenes[0];
        mesh.animations = gltfModel.animations;

        //--------------

        const clips = mesh.animations

        if (clips.length > 1) {
            console.warn('[gltf-animation] Only 1 animation clip per file is supported.');
        }
        this.clip = clips[0];

      //  console.log("gltf-animation clips", clips, this.data.name)

        this.clip.name = this.data.name || this.clip.name;
        this.appendClip();
    },

    appendClip: function () {
        var el = this.el;
        var mesh = el.getObject3D('mesh')//.children[0];

        if (mesh && this.clip) {

            mesh.animations = mesh.animations || [];

            mesh.animations.push(this.clip);

            el.emit('animation-loaded', { format: 'gltf', clip: this.clip });
        }
    }
};