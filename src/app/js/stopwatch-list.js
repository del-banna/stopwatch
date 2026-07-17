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

        this.onStateUpdate("list-clear");
        return this;
    }

    // 
    // 
    // 

    computeNextInstanceName() {
        let baseName = 'new stopwatch';
        let name = baseName;
        if (this.registeredCount) {
            let count = this.registeredCount;
            name = `${baseName} (${count})`;
            // If any instance shares the name, increment count until no match is found.
            while (Object.values(this.internalMap).some((instance) => instance.model.name === name)) {
                name = `${baseName} (${++count})`;
            };
        }
        return name;
    }
}