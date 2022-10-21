export const getCurrentTime = Date.now;

export function formatTime(milliseconds) {
    let d = new Date(milliseconds + (new Date().getTimezoneOffset() * 60 * 1000));
    function pad(n, length) {
        n = `${n}`;
        let len = n.length;
        return len < length ? "0".repeat(length - len) + n : n;
    }
    return [...[d.getHours(), d.getMinutes(), d.getSeconds()].map(n => pad(n, 2)), pad(d.getMilliseconds(), 4)].join(":");
}

export class StopWatch {
    constructor(name) {
        this.name = name;
        this.previousTime = 0;
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