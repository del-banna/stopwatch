import { defaultStateUpdateCbFn, generateHex16, generateHex8 } from "../utils.js";

const getCurrentTime = Date.now;

export class Stopwatch {

    static SCHEMA = {
        name: { type: "string" },
        previousTime: { type: "number", required: false, default: 0 },
        lastResumed: { type: "number", required: false, default: undefined },
        index: { type: "number", required: false, default: -1 }
    }

    /**
     * @param {*} Object Construction object: An object containing the properties used to construct a new Stopwatch instance.
     * @returns Stopwatch instance.
     */
    static createNew({ name = undefined, previousTime = 0, lastResumed = undefined, index = -1, onStateUpdate = defaultStateUpdateCbFn } = {}) {
        return new Stopwatch(name, previousTime, lastResumed, index, onStateUpdate);
    }

    constructor(
        name,
        previousTime = 0,
        lastResumed = undefined,
        index = -1,
        onStateUpdate = defaultStateUpdateCbFn,
    ) {
        this.name = name;
        this.previousTime = previousTime;
        this.lastResumed = lastResumed;
        this._index = index;
        this.onStateUpdate = onStateUpdate;
        this.id = `[SW-${generateHex16().toUpperCase()}](${name})`;
    }

    get index() {
        return this._index;
    }

    set index(index) {
        this._index = index;
        this.onStateUpdate("index", index);
    }

    get active() {
        return this.lastResumed != undefined;
    }

    get time() {
        if (!this.active)
            return this.previousTime;
        return this.previousTime + (getCurrentTime() - this.lastResumed);
    }

    resume() {
        if (this.active) return;
        this.lastResumed = getCurrentTime();
        this.onStateUpdate("resume");
        return this;
    }

    pause() {
        if (!this.active) return;
        this.previousTime = this.time;
        this.lastResumed = undefined;
        this.onStateUpdate("pause");
        return this;
    }

    reset() {
        this.previousTime = 0;
        if (this.active)
            this.lastResumed = getCurrentTime();
        this.onStateUpdate("reset");
        return this;
    }

    rename(name) {
        this.name = name;
        this.onStateUpdate("rename", name);
        return this;
    }

    remove() {
        this.pause();
        this.onStateUpdate("remove");
        return this;
    }

    getConstructionObject() {
        return {
            name: this.name,
            previousTime: this.previousTime,
            lastResumed: this.lastResumed,
            index: this._index
        };
    }
}