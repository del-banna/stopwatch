import { setupDownloadListener, toJSONP } from "./utils.js";
import { listElement, createNewStopwatchButton, downloadAllButton, linkButton, copyAllButton, pasteButton, uploadButton, promptEditText, promptTextInput, createDynamicTextArea, hide, promptTextInputAt, downloadText, copyLinkButton, promptUploadText, dynamicURLSwitch, concurrencySwitch } from "./view.js";
import { Stopwatch } from "./stopwatch.js";
import { StopwatchList } from "./stopwatch-list.js";
import { StopwatchListViewBinding, StopwatchViewBinding, ConfigurationViewBinding } from "./binding.js";
import { StopwatchConfiguration } from "./settings.js";


//
// Parameters
// 

const browserQueryObj = Object.fromEntries(window.location.search.replace('?', '&').split("&").filter(str => !!str).map(str => str.split('=').map(urie => decodeURI(urie))));
const stopwatchFileExtension = '.swljson';

//
//
//

// Orchestrates top-level logic, including StopwatchList instantiation, wiring of view events, configuration loading, top-level serialization and deserialization.
class Controller {
    /** @type {Controller} */
    static instance = null;

    static initialize() {
        if (this.instance)
            throw Error("A controller instance already exists!");

        const configuration = new StopwatchConfiguration(); //defaults; this should be imported, if browser query string valid.
        const configurationBinding = new ConfigurationViewBinding(
            configuration,
            { dynamicURLSwitch, concurrencySwitch },
            (name, value) => {
                //settings have changed
                console.log(`Settings changed (${name}: ${value})\n${toJSONP(configuration.settings)}`);
            }).initialize();

        const list = StopwatchList.initialize();
        const listViewBinding = new StopwatchListViewBinding(list, listElement).initialize();

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
        return StopwatchViewBinding.createNew(sw, this.listViewBinding).initialize();
    }
}


Controller.initialize();