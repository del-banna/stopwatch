import { defaultStateUpdateCbFn, toJSONP } from "./utils.js";
import { resumeAllButton, pauseAllButton, resetAllButton, deleteAllButton, StopwatchElement, concurrencySwitch, dynamicURLSwitch } from "./view.js";
import { Configuration } from "./settings.js";
import { Stopwatch } from "./stopwatch.js";
import { StopwatchList } from "./stopwatch-list.js";

export class ConfigurationBinding {
    constructor(
        /**@type {Configuration} */ configuration,
        view = { concurrencySwitch, dynamicURLSwitch },
        onStateUpdate = defaultStateUpdateCbFn
    ) {
        this.configuration = configuration;
        this.view = view;
        this.onStateUpdate = onStateUpdate;
    }

    initialize() {
        // Inbound state updates
        this.view.dynamicURLSwitch.checkboxElement.addEventListener('change', (e) => {
            this.configuration.setDynamicURL(e.target.checked);
        });

        this.view.concurrencySwitch.checkboxElement.addEventListener('change', (e) => {
            this.configuration.setConcurrency(e.target.checked);
        })

        // Outbound state updates
        this.configuration.onStateUpdate = (propertyName, value) => {
            let viewObj = undefined;

            switch (propertyName) {
                case "dynamicURL":
                    viewObj = this.view.dynamicURLSwitch;
                    break;

                case "concurrency":
                    viewObj = this.view.concurrencySwitch;
                    break;

                default:
                    break;
            }

            if (viewObj) {
                if (!viewObj.checkboxElement.checked == value)
                    viewObj.checkboxElement.checked = value;
            }

            this.onStateUpdate(propertyName, value);
        };

        // Initial update to sync view
        this.configuration.emitPropertyStateUpdates();

        return this;
    }
}


//
//
//

export class StopwatchListBinding {
    constructor(
    /**@type {StopwatchList}*/ stopwatchList,
        /**@type {HTMLElement}*/ stopwatchListElement
    ) {
        this.stopwatchList = stopwatchList;
        this.stopwatchListElement = stopwatchListElement;

    }

    initialize() {
        if (!(this.stopwatchList && this.stopwatchListElement))
            throw new Error(`Cannot activate list view binding: invalid references. \n\t${toJSONP(this)}`);

        // Inbound UI actions
        resumeAllButton.onclick = () => this.stopwatchList.resumeAll();
        pauseAllButton.onclick = () => this.stopwatchList.pauseAll();
        resetAllButton.onclick = () => this.stopwatchList.resetAll();
        deleteAllButton.onclick = () => this.stopwatchList.removeAll();

        //Outbound state changes
        this.stopwatchList.onStateUpdate = function (propertyName, value) {
        };

        return this;
    }
}

//
//
//

export class StopwatchBinding {
    // Stopwatch.id : StopwatchListViewBinding
    /**@type {Map<String, StopwatchBinding>} */
    static stopwatchViewBindingMap = new Map();

    static defaultBindingCallback = (/**@type {StopwatchBinding}*/binding) => { };

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
        }

        // Other events
        el.ondownload = () => { if (this.ondownload) this.ondownload(this) };
        el.oncopy = () => { if (this.oncopy) this.oncopy(this) };

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

