import { setupDownloadListener, toJSONP } from "./utils.js";
import { listElement, createNewStopwatchButton, StopwatchElement, downloadAllButton, resetAllButton, resumeAllButton, pauseAllButton, deleteAllButton, linkButton, copyAllButton, pasteButton, uploadButton, promptEditText, promptTextInput, createDynamicTextArea, hide, promptTextInputAt, downloadText, copyLinkButton, promptUploadText, dynamicURLSwitch } from "./view.js";
import { Stopwatch } from "./stopwatch.js";
import { StopwatchList } from "./stopwatch-list.js";


//
// Parameters
// 

const browserQueryObj = Object.fromEntries(window.location.search.replace('?', '&').split("&").filter(str => !!str).map(str => str.split('=').map(urie => decodeURI(urie))));
const stopwatchFileExtension = '.swljson';

//
//
//

class StopwatchListViewBinding {
    constructor(
        /**@type {StopwatchList}*/ stopwatchList,
        /**@type {HTMLElement}*/ stopwatchListElement,
    ) {
        this.stopwatchList = stopwatchList;
        this.stopwatchListElement = stopwatchListElement;
    }

    activateBinding() {
        if (!(this.stopwatchList && this.stopwatchListElement))
            throw new Error(`Cannot activate list view binding: invalid references. \n\t${toJSONP(this)}`);

        // Inbound UI actions
        resumeAllButton.onclick = () => this.stopwatchList.resumeAll();
        pauseAllButton.onclick = () => this.stopwatchList.pauseAll();
        resetAllButton.onclick = () => this.stopwatchList.resetAll();
        deleteAllButton.onclick = () => this.stopwatchList.removeAll();

        //Outbound state changes
        this.stopwatchList.onStateUpdate = function (propertyName, value) {

        }

        return this;
    }
}

// 
// 
// 


class StopwatchViewBinding {
    // Stopwatch.id : StopwatchListViewBinding
    /**@type {Map<String, StopwatchViewBinding>} */
    static stopwatchViewBindingMap = new Map();

    static createNew(
        /**@type {Stopwatch}*/ stopwatch,
        /**@type {StopwatchListViewBinding}*/ parentListViewBinding
    ) {
        const stopwatchElement = new StopwatchElement(
            parentListViewBinding.stopwatchListElement,
            stopwatch.model.name,
            () => stopwatch.model.time,
            () => stopwatch.model.isActive
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

    activateBinding() {
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
        }


        // It might be best to decouple the implementation of these from the class using callbacks
        // Export/save
        // stopwatchElement.ondownload = setupDownloadListener(stopwatchElement.downloadButton, () => this.asJSONList());
        // stopwatchElement.oncopy = () => this.copy();

        return this;
    }

}

//
//
//



// class ConfigurationViewBinding {

// }

// Orchestrates top-level logic, including StopwatchList instantiation, wiring of view events, configuration loading, top-level serialization and deserialization.
class Controller {
    /** @type {Controller} */
    static instance = null;

    static initialize() {
        if (this.instance)
            throw Error("A controller instance already exists!");

        const list = StopwatchList.initialize();
        const listViewBinding = new StopwatchListViewBinding(list, listElement).activateBinding();

        const instance = new Controller(listViewBinding);
        this.instance = instance;

        // Adding new stopwatches
        createNewStopwatchButton.onclick = () => instance.createStopwatch();


        // Import/export control and other UI bindings

        //
        // Data imports
        //

        // If nothing is imported, create a single stopwatch by default.
        if (!list.internalMap.size) {
            instance.createStopwatch();
        }
    }

    constructor(
        /**@type {StopwatchListViewBinding} */ listViewBinding
    ) {
        this.listViewBinding = listViewBinding;
    }

    createStopwatch({ name = undefined, time = 0, lastResumed = undefined } = {}) {
        let sw = new Stopwatch(name ?? this.listViewBinding.stopwatchList.computeNextInstanceName(), time, lastResumed);
        this.listViewBinding.stopwatchList.add(sw);
        return StopwatchViewBinding.createNew(sw, this.listViewBinding).activateBinding();
    }
}


Controller.initialize();