export const getCurrentTime = Date.now;

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