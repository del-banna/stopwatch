export const getCurrentTime = Date.now;

export class StopwatchFunction {
    constructor(name, initialTime = 0) {
        this.name = name;
        this.previousTime = initialTime;
        this.resumeTime = undefined;
        this.start = this.resume;
        this.stop = this.pause;
    }

    get isActive() {
        return this.resumeTime != undefined;
    }

    get time() {
        if (!this.isActive)
            return this.previousTime;
        return this.previousTime + (getCurrentTime() - this.resumeTime);
    }

    get hasStarted() {
        return this.previousTime > 0 || this.isActive;
    }

    get hasStopped() {
        return this.previousTime > 0 && !this.isActive;
    }

    resume() {
        if (this.isActive) return;
        this.resumeTime = getCurrentTime();
        return this;
    }

    pause() {
        if (!this.isActive) return;
        this.previousTime = this.time;
        this.resumeTime = undefined;
        return this;
    }

    reset() {
        this.previousTime = 0;
        if (this.isActive)
            this.resumeTime = getCurrentTime();
        return this;
    }
}