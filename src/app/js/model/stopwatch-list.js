import { Stopwatch } from "./stopwatch.js";

const defaultStateUpdateCbFn = function (property = "", value = undefined) {
}

export class StopwatchList {
    /** @type {StopwatchList} */
    static instance = null;

    static assignInstance(/** @type {StopwatchList} */ listInstance) {
        if (this.instance != null)
            throw new Error("StopwatchList instance is already assigned. Cannot reassign StopwatchList instance.");

        this.instance = listInstance;
    }

    static initialize(onStateUpdate = defaultStateUpdateCbFn) {
        if (this.instance != null)
            throw new Error("A StopwatchList instance already exists. Cannot reinitialize StopwatchList.");

        const listInstance = new StopwatchList(onStateUpdate);
        this.assignInstance(listInstance);

        return listInstance;
    }

    constructor(onStateUpdate = defaultStateUpdateCbFn) {
        /** @type {Map<String, Stopwatch>} */
        this.internalMap = new Map();
        this.registeredCount = 0;
        // For outbound state change propagation
        this.onStateUpdate = onStateUpdate;
    }

    // 
    // Addition and removal
    //    

    add(/**@type {Stopwatch[]} */...stopwatches) {
        stopwatches.forEach(s => {
            this.internalMap.set(s.id, s);
        });

        this.registeredCount += stopwatches.length;
        this.onStateUpdate("list-add", stopwatches);
        return this;
    }

    remove(...objs) {
        objs.forEach(o => {
            let instance = undefined;

            if (typeof o === String) {
                instance = this.internalMap.get(instance);
            } else
                if (o instanceof Stopwatch) {
                    instance = o;
                }

            if (!instance) {
                console.warn(`Could not remove object ${o}: object is not a recognized id or instance.`)
                return;
            }

            instance.remove();
            this.internalMap.delete(instance.id);
        });

        this.onStateUpdate("list-remove", objs);
        return this;
    }

    getStopwatches() {
        return Array.from(this.internalMap.values());
    }

    //
    // Iteration and collection operations
    // 

    forEach(callbackfn = ((/** @type {Stopwatch} */ instance) => { })) {
        Array.from(this.internalMap.values()).forEach(callbackfn);
    };


    getAggregateCallbackFn(callbackfn = ((/** @type {Stopwatch} */ instance) => { })) {
        return () => this.forEach(callbackfn);
    }

    resumeAll() {
        this.forEach(i => i.resume());
        this.onStateUpdate("list-resume");
        return this;
    }

    pauseAll() {
        this.forEach(i => i.pause());
        this.onStateUpdate("list-pause");
        return this;
    }

    resetAll() {
        this.forEach(i => i.reset());
        this.onStateUpdate("list-reset");
        return this;
    }

    removeAll() {
        this.forEach(i => i.remove());
        this.internalMap.clear();
        this.registeredCount = 0;

        this.onStateUpdate("list-clear");
        return this;
    }

    // 
    // 
    // 

    computeNextInstanceName() {
        let baseName = 'new stopwatch';
        let name = baseName;
        let count = this.registeredCount - 1;



        let names = this.getStopwatches().map(sw => sw.name);
        while (names.some(n => n === name)) {
            name = `${baseName} (${++count})`;
        };

        return name;
    }

    computeNextIndex() {
        if (this.internalMap.size < 2)
            return this.internalMap.size;

        return Math.max(...Array.from(this.internalMap.values()).map(sw => sw.index)) + 1;
    }
}