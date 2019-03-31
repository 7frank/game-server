// @ts-ignore
import {EventEmitter} from 'eventemitter3';

/**
 * @callback onFrameCallback
 * @param {object} info - An object containing additional information of the current frame.
 * @param {number} info.time - A timestamp.
 * @param {number} info.frame - The auto incrementation identifier of the current frame.
 * @param {FPSCtrl} info.script - A reference to the FPSCtrl itself.
 *
 */

/**
 * A simple FPS - limiter.
 * For reference to the original code see {@link https://stackoverflow.com/a/19773537}
 * Implements some additional performance measurement to keep track of frames this are really slow.
 *
 *  TODO refactor into class and extend EE
 *
 * @param {number} fps - A Number indicating the times per second 'onFrame' gets called.
 * @param {onFrameCallback} onFrame - A callback function.
 * @param {object} [context] - A context the 'onFrame' functions gets bound to.
 * @constructor
 */

interface FrameInfo {
    time: number; // timestamp
    progress,   // progress since first start - pauses
    frame: number; // number of actual rendered frame
    script: FPSCtrl; // a reference to the FPSCtrl itself to be able to control play pause etc
}


/**
 * FIXME setting time via currentTime will not work in some edge cases
 *
 *
 *
 */

export class FPSCtrl {

    public paused: boolean = true;

    protected _events:any = new EventEmitter();  //FIXME type should not have to be any to cirvumvent error
    private tref;
    private timestamp = 0 // time the ctrl is started the first time
    private timestampStart = null // time the ctrl is started the first time
    private offset = 0 // time the ctrl is started the first time
    private pausedAt = null // time the ctrl is started the first time
    private delay: number; // calc. time per frame
    private frame = -1; // frame count
    private mCurrentTime: number = 0; // time in seconds of the current running

    /**
     *
     * @param fps - upper bound for frames per second.
     * @deprecated @param onFrame
     * @param context
     */
    constructor(protected fps: number = 30) {
        this.delay = 1000 / fps
    }

    get currentTime(): number {
        return this.mCurrentTime
    }

    set currentTime(val: number) {
        this.mCurrentTime = val
        this.tref = requestAnimationFrame((t) => this.scriptLoop(t));

    }

// set frame-rate
    frameRate(newfps) {
        if (!arguments.length) return this.fps;
        this.fps = newfps;
        this.delay = 1000 / this.fps;
        //  this.frame = -1;
        //  this.timestampStart = null;

        return this;
    };

// enable starting/pausing of the object
    start() {

        if (this.paused) {
            this.paused = false;
            this.currentTime = 0;
            // this.tref = requestAnimationFrame((t)=>this.scriptLoop(t));
            this._events.emit("start")

        }
        return this;
    };

    /**
     * circumvent fps limit
     * alter 'time' so the next time loop gets called the next frame will be updated
     */
    forceNext() {
        this.timestampStart -= this.delay;
        return this;
    };

    resume() {

        if (this.paused) {
            this.paused = false;
            this.currentTime = this.currentTime;
            // this.tref = requestAnimationFrame((t)=>this.scriptLoop(t));
            this._events.emit("resume")

        }

    }

    pause() {

        if (!this.paused) {

            this.pausedAt = this.timestamp

            cancelAnimationFrame(this.tref);
            this.paused = true;
            this._events.emit("pause")
        }
        return this;
    };

    stop() {
        if (!this.paused) {
            cancelAnimationFrame(this.tref);
            this.paused = true;
            this.timestampStart = null;
            this.frame = -1;

            this.pausedAt = null
            this.offset = 0

            this._events.emit("stop")
        }
    };

    on(event, cb) {
        this._events.on(event, cb)
        return this
    }

    off(event, cb) {
        this._events.removeListener(event, cb)
        return this
    }

    protected scriptLoop(timestamp) {

        this.timestamp = timestamp;

        if (this.timestampStart === null) this.timestampStart = timestamp; // init start time


        if (this.pausedAt) {
            const currentOffset = timestamp - this.pausedAt
            this.offset += currentOffset
            this.pausedAt = null
        }


        const progress = timestamp - this.timestampStart - this.offset


        // init next frame by setting the current time variable
        if (!this.paused)
            this.currentTime = progress / 1000


        var seg = Math.floor(progress / this.delay); // calc frame no.
        if (seg > this.frame) { // moved to next frame?
            this.frame = seg; // update

            const info = { // callback function
                time: timestamp,
                progress,
                frame: this.frame,
                script: this,

            }
            this._events.emit("frame", info as FrameInfo)


        }

    }


}
