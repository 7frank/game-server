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

        const clips = mesh.animations

        console.log("aaa00", clips)
        if (clips.length > 1) {
            console.warn('[fbx-animation] Only 1 animation clip per file is supported.');
        }
        this.clip = clips[0];

        console.log("fbx-animation clips", clips, this.data.name)

        this.clip.name = this.data.name || this.clip.name;
        this.appendClip();
    },

    appendClip: function () {
        var el = this.el;
        var mesh = el.getObject3D('mesh')//.children[0];
        console.log("aaa1", mesh, this)
        if (mesh && this.clip) {
            console.log("aaa2")
            mesh.animations = mesh.animations || [];


            //TODO The position data in the fbx files are scaled by factor 100 and need to be alered to match those within the glb file (afaik)
            this.clip.tracks.forEach(track => {
                for (let len = track.values.length, i = 0; i < len; i++) {
                    if (track.name.indexOf('.position')>-1)
                    track.values[i] = track.values[i] / 100
                }
            })

            mesh.animations.push(this.clip);
            console.log("aaa3", mesh)
            el.emit('animation-loaded', { format: 'fbx', clip: this.clip });
        }
    }
};