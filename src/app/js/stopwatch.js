import { defaultStateUpdateCbFn, generateHex8 } from "./utils.js";

const getCurrentTime = Date.now;

export class Stopwatch {
    /**
     * @param {*} Object Construction object: An object containing the properties used to construct a new Stopwatch instance.
     * @returns Stopwatch instance.
     */
    static createNew({ name = "stopwatch", time = 0, lastResumed = undefined, onStateUpdate = defaultStateUpdateCbFn } = {}) {
        return new Stopwatch(name, time, lastResumed, onStateUpdate);
    }

    constructor(
        name,
        initialTime = 0,
        lastResumed = undefined,
        onStateUpdate = defaultStateUpdateCbFn,
    ) {
        this.name = name;
        this.previousTime = initialTime;
        this.lastResumed = lastResumed;
        this.onStateUpdate = onStateUpdate;
        this.id = `sw-${generateHex8}-${name}`;
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
        this.onStateUpdate("resume", undefined);
        return this;
    }

    pause() {
        if (!this.active) return;
        this.previousTime = this.time;
        this.lastResumed = undefined;
        this.onStateUpdate("pause", undefined);
        return this;
    }

    reset() {
        this.previousTime = 0;
        if (this.active)
            this.lastResumed = getCurrentTime();
        this.onStateUpdate("reset");
        return this;
    }

    rename(value) {
        this.name = name;
        this.onStateUpdate("rename", value);
        return this;
    }

    remove() {
        this.model.pause();
        this.onStateUpdate("remove");
        return this;
    }

    getConstructionObject() {
        return {
            name: this.model.name,
            time: this.model.time,
            lastResumed: this.model.lastResumed
        };
    }
}