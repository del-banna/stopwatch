import { generateHex8 } from "./utils.js";

const getCurrentTime = Date.now;

const defaultStateUpdateCbFn = function (name = "", value = undefined) {
}

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
        this.model = new StopwatchFunction(name, initialTime, lastResumed);
        this.onStateUpdate = onStateUpdate;
        this.id = `sw-${generateHex8}-${name}`;
    }

    rename(value) {
        this.model.rename(value);
        this.onStateUpdate("rename", value);
    }

    pause() {
        this.model.pause();
        this.onStateUpdate("pause", false);
    }

    resume() {
        this.model.resume();
        this.onStateUpdate("resume", true);
    }

    reset() {
        this.model.reset();
        this.onStateUpdate("reset");
    }

    remove() {
        this.model.pause();
        this.onStateUpdate("remove");
    }

    getConstructionObject() {
        return {
            name: this.model.name,
            time: this.model.time,
            lastResumed: this.model.lastResumed
        };
    }


    // static fromJSON(jsonString) {
    //     return this.createNew(JSON.parse(jsonString));
    // }

    // State update callback
    // getStateUpdateCallback(updateState = (...args) => { }) {
    //     return ((...args) => {
    //         updateState(...args);
    //         this.onStateUpdate();
    //     }).bind(this);
    // }

    // download() {
    //     console.log(this.toJSON());
    // }

    // copy() {
    //     return navigator.clipboard.writeText(this.asJSONList());
    // }
}

export class StopwatchFunction {
    constructor(name, initialTime = 0, lastResumed = undefined) {
        this.name = name;
        this.previousTime = initialTime;
        this.lastResumed = lastResumed;

        // Method aliases
        this.start = this.resume;
        this.stop = this.pause;
    }

    get isActive() {
        return this.lastResumed != undefined;
    }

    get time() {
        if (!this.isActive)
            return this.previousTime;
        return this.previousTime + (getCurrentTime() - this.lastResumed);
    }

    get hasStarted() {
        return this.previousTime > 0 || this.isActive;
    }

    get hasStopped() {
        return this.previousTime > 0 && !this.isActive;
    }

    rename(name) {
        this.name = name;
    }

    resume() {
        if (this.isActive) return;
        this.lastResumed = getCurrentTime();
        return this;
    }

    pause() {
        if (!this.isActive) return;
        this.previousTime = this.time;
        this.lastResumed = undefined;
        return this;
    }

    reset() {
        this.previousTime = 0;
        if (this.isActive)
            this.lastResumed = getCurrentTime();
        return this;
    }
}