import { toJSONP } from "../utils.js";
import { StopwatchElement } from "../view/view.js";
import { Stopwatch } from "../model/stopwatch.js";

//
//
//

export class StopwatchBinding {
    // Stopwatch.id : StopwatchListViewBinding
    /**@type {Map<String, StopwatchBinding>} */
    static stopwatchViewBindingMap = new Map();

    static defaultBindingCallback = (/**@type {StopwatchBinding}*/ binding) => { };

    static createViewElement(
    /**@type {Stopwatch} */ stopwatch,
        /**@type {StopwatchListBinding} */ parentListBinding
    ) {
        const el = new StopwatchElement(
            parentListBinding.stopwatchListElement,
            stopwatch.name,
            () => stopwatch.time,
            () => stopwatch.active
        );

        el.dragEnable(parentListBinding.stopwatchListElement);
        return el;
    }

    static createNew(
    /**@type {Stopwatch}*/ stopwatch,
        /**@type {StopwatchListBinding} */ parentListBinding,
        onremove = this.defaultBindingCallback,
        ondownload = this.defaultBindingCallback,
        oncopy = this.defaultBindingCallback
    ) {
        const stopwatchElement = this.createViewElement(stopwatch, parentListBinding);
        return new StopwatchBinding(stopwatch, stopwatchElement, onremove, ondownload, oncopy);
    }

    constructor(
    /**@type {Stopwatch}*/ stopwatch,
        /**@type {StopwatchElement} */ stopwatchViewElement,
        onremove = StopwatchBinding.defaultBindingCallback,
        ondownload = StopwatchBinding.defaultBindingCallback,
        oncopy = StopwatchBinding.defaultBindingCallback
    ) {
        this.stopwatch = stopwatch;
        this.element = stopwatchViewElement;

        this.onremove = onremove;
        this.ondownload = ondownload;
        this.oncopy = oncopy;

        StopwatchBinding.stopwatchViewBindingMap.set(stopwatch.id, this);
    }

    initialize() {
        if (!(this.element && this.stopwatch))
            throw new Error(`Cannot activate stopwatch view binding: invalid references. \n\t${toJSONP(this)}`);

        let sw = this.stopwatch;
        let el = this.element;

        // Inbound state updates from UI actions
        el.onresume = () => sw.resume();
        el.onpause = () => sw.pause();
        el.onreset = () => sw.reset();
        el.onrename = (name) => sw.rename(name);

        // Previously assigned listener, if any
        let onStateUpdateCbFn1 = sw.onStateUpdate;

        // Outbound state updates
        let onStateUpdateCbFn2 = (name, value) => {
            switch (name) {
                case "pause":
                    el.stop();
                    break;

                case "resume":
                    el.start();
                    break;

                case "reset":
                    el.updateView();
                    break;

                case "rename":
                    el.name = value;
                    break;

                case "remove":
                    {
                        el.remove();
                        StopwatchBinding.stopwatchViewBindingMap.delete(sw.id);
                        break;
                    }

                default:
                    break;
            }
        };

        // Aggregate listener
        sw.onStateUpdate = (name, value) => {
            if (onStateUpdateCbFn1)
                onStateUpdateCbFn1(name, value);
            onStateUpdateCbFn2(name, value);
        };

        // Other events
        el.ondownload = () => { if (this.ondownload) this.ondownload(this); };
        el.oncopy = () => { if (this.oncopy) this.oncopy(this); };

        el.ondelete = () => {
            sw.remove();
            if (this.onremove)
                this.onremove(this);
        };


        // Ordering
        this.element.onrearrange = (/**@type {HTMLElement[]}*/ objs) => {
            // Information about the order of stopwatches in a list might be best stored in the stopwatches rather than be implicit.
            // After the refactoring, it is not only technically cumbersome to continue to use implicit array order, it is also unreliable and compels unwieldy workarounds.
            // Define an order/index variable in Stopwatch
            // **OBSOLETE
            // if (this.parentList)
            // this.parentList.rearrangeInstanceElements(...args);
        };

        // rearrangeInstanceElements(/** @type {HTMLElement[]} */ elements) {
        //     let oldValue = this.internalMap;
        //     this.internalMap = elements.map(element => oldValue.getStopwatchInstanceByElement(element)).filter(sw => !!sw);
        // }
        // rearrange(/**@type {String[]}*/ ids) {
        // }
        return this;
    }
}
