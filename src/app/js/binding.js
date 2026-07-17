import { defaultStateUpdateCbFn, toJSONP } from "./utils.js";
import { resumeAllButton, pauseAllButton, resetAllButton, deleteAllButton, StopwatchElement, concurrencySwitch, dynamicURLSwitch } from "./view.js";
import { StopwatchConfiguration } from "./settings.js";

export class ConfigurationViewBinding {
    constructor(
        /**@type {StopwatchConfiguration} */ configuration,
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
            console.log("test");
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

export class StopwatchListViewBinding {
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

export class StopwatchViewBinding {
    // Stopwatch.id : StopwatchListViewBinding
    /**@type {Map<String, StopwatchViewBinding>} */
    static stopwatchViewBindingMap = new Map();

    static createNew(
    /**@type {Stopwatch}*/ stopwatch,
        /**@type {StopwatchListViewBinding}*/ parentListViewBinding
    ) {
        const stopwatchElement = new StopwatchElement(
            parentListViewBinding.stopwatchListElement,
            stopwatch.name,
            () => stopwatch.time,
            () => stopwatch.active
        );

        return new StopwatchViewBinding(stopwatch, stopwatchElement, parentListViewBinding);
    }

    constructor(
    /**@type {Stopwatch}*/ stopwatch,
        /**@type {StopwatchElement} */ stopwatchViewElement,
        /**@type {StopwatchListViewBinding}*/ parentListViewBinding
    ) {
        this.stopwatch = stopwatch;
        this.element = stopwatchViewElement;
        this.parentListViewBinding = parentListViewBinding;

        StopwatchViewBinding.stopwatchViewBindingMap.set(stopwatch.id, this);
    }

    initialize() {
        if (!(this.element && this.stopwatch && this.parentListViewBinding))
            throw new Error(`Cannot activate stopwatch view binding: invalid references. \n\t${toJSONP(this)}`);

        let sw = this.stopwatch;
        let el = this.element;

        // Inbound state updates from UI actions
        el.onresume = () => sw.resume();
        el.onpause = () => sw.pause();
        el.onreset = () => sw.reset();
        el.onrename = (name) => sw.rename(name);
        el.ondelete = () => {
            this.parentListViewBinding.stopwatchList.remove(sw);
        };

        // el.oncopy = 
        // Outbound state updates
        sw.onStateUpdate = (name, value) => {
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
                        StopwatchViewBinding.stopwatchViewBindingMap.delete(sw.id);
                        break;
                    }

                default:
                    break;
            }
        };


        // Ordering
        // this.element.dragEnable(this.parentListViewBinding.stopwatchListElement);
        this.element.onrearrange = (/**@type {HTMLElement[]}*/ objs) => {
            // Information about the order of stopwatches in a list might be best stored in the stopwatches rather than be implicit.
            // After the refactoring, it is not only technically cumbersome to continue to use implicit array order, it is also unreliable and compels unwieldy workarounds.
            // Define an order/index variable in Stopwatch
            // **OBSOLETE
            // if (this.parentList)
            // this.parentList.rearrangeInstanceElements(...args);
        };


        // It might be best to decouple the implementation of these from the class using callbacks
        // Export/save
        // stopwatchElement.ondownload = setupDownloadListener(stopwatchElement.downloadButton, () => this.asJSONList());
        // stopwatchElement.oncopy = () => this.copy();
        return this;
    }
}

