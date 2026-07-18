import { toJSONP } from "../utils.js";
import { StopwatchElement } from "../view/view.js";
import { Stopwatch } from "../model/stopwatch.js";
import { StopwatchListBinding } from "./stopwatch-list-binding.js";

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
            () => stopwatch.active,
            { id: stopwatch.id }
        );
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
        const binding = new StopwatchBinding(stopwatch, stopwatchElement, onremove, ondownload, oncopy);
        binding.element.dragEnable(parentListBinding.stopwatchListElement, (arr) => parentListBinding?.onrearrange(arr, binding));
        return binding;
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

        return this;
    }
}
