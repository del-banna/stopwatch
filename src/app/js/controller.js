import { constructQueryString, decodeBase64Url, encodeBase64Url, parseQueryObject, toJSONP } from "./utils.js";
import { listElement, createNewStopwatchButton, downloadAllButton, linkButton, copyAllButton, pasteButton, uploadButton, promptEditText, promptTextInput, createDynamicTextArea, hide, promptTextInputAt, downloadText, copyLinkButton, promptUploadText, initiateNamedDownloadPrompt, dynamicURLSwitch, concurrencySwitch } from "./view/view.js";
import { Stopwatch } from "./model/stopwatch.js";
import { StopwatchList } from "./model/stopwatch-list.js";
import { StopwatchBinding } from "./binding/stopwatch-binding.js";
import { StopwatchListBinding } from "./binding/stopwatch-list-binding.js";
import { ConfigurationBinding } from "./binding/configuration-binding.js";
import { Configuration } from "./model/configuration.js";
import { DATA_OBJECT_SCHEMA, toDataObjectJSON } from "./data/data.js";
import { validateSchema } from "./data/json-schema.js";


//
// Parameters
// 

export const initialBrowserQueryObj = parseQueryObject();
export const stopwatchFileExtension = 'swjson';

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

        const list = StopwatchList.initialize();
        const listBinding = new StopwatchListBinding(list, listElement).initialize();

        const configuration = new Configuration(); //defaults; this should be imported if browser query string valid.
        const configurationBinding = new ConfigurationBinding(
            configuration,
            { dynamicURLSwitch, concurrencySwitch }
        ).initialize();

        const controller = new Controller(
            configurationBinding,
            listBinding
        );
        this.instance = controller;
        return controller;
    }

    constructor(
        /**@type {ConfigurationBinding} */ configurationBinding,
        /**@type {StopwatchListBinding} */ listBinding
    ) {
        this.configurationBinding = configurationBinding;
        this.listBinding = listBinding;

        this.configurationBinding.onStateUpdate = (prop, val) => this.onStateUpdate(prop, val);
        this.listBinding.stopwatchList.onStateUpdate = (prop, val) => this.onStateUpdate(prop, val);
    }

    onStateUpdate(prop = undefined, val = undefined) {
        const settings = this.configurationBinding.configuration.settings;
        if (!settings.concurrency && prop === "resume") {
            //requires object reference. Must update onStateUpdate to pass it.
        }

        if (settings.dynamicURL)
            this.updateBrowserURLDataQuery();
    }

    createStopwatch({ name = undefined, previousTime = 0, lastResumed = undefined } = {}) {
        const list = this.listBinding.stopwatchList;
        const sw = new Stopwatch(name ?? list.computeNextInstanceName(), previousTime, lastResumed, (prop, val) => this.onStateUpdate(prop, val));
        const swbinding = StopwatchBinding.createNew(
            sw,
            this.listBinding,
            // onremove
            (binding) => list.remove(binding.stopwatch),
            // ondownload
            (binding) => initiateNamedDownloadPrompt(binding.element.downloadButton, toDataObjectJSON(undefined, [binding.stopwatch]), stopwatchFileExtension),
            // oncopy
            (binding) => navigator.clipboard.writeText(toDataObjectJSON(undefined, [binding.stopwatch]))
        ).initialize();

        list.add(sw);
        return swbinding;
    }

    getDataAsJSON() {
        return toDataObjectJSON(
            this.configurationBinding.configuration.settings,
            Array.from(this.listBinding.stopwatchList.internalMap.values())
        );
    }

    getDataAsBase64URL() {
        return encodeBase64Url(this.getDataAsJSON());
    }

    getDataAsQueryString() {
        let browserQueryObj = parseQueryObject();
        browserQueryObj.data = this.getDataAsBase64URL();
        return constructQueryString(browserQueryObj);
    }

    initiateFullDataDownload() {
        initiateNamedDownloadPrompt(downloadAllButton, this.getDataAsJSON(), stopwatchFileExtension);
    }

    importDataFromJSON(json) {
        let rawObj = undefined;
        let validated = undefined;
        try {
            rawObj = JSON.parse(json);
            validated = validateSchema(rawObj, DATA_OBJECT_SCHEMA);

            if (validated.settings) {
                let previousSettings = this.configurationBinding.configuration.settings;
                this.configurationBinding.configuration.settings = { ...previousSettings, ...validated.settings };
                this.configurationBinding.configuration.emitPropertyStateUpdates();
            }

            if (validated.stopwatches && validated.stopwatches.length) {
                validated.stopwatches.forEach(swconstructionObj => {
                    this.createStopwatch(swconstructionObj);
                });
            }

            return validated;
        } catch (err) {
            console.warn(`Failed to import data from text/json: \n\t${json}`);
            console.error(err);
            return null;
        }
    }

    importDataFromBase64URL(base64url) {
        let json = decodeBase64Url(base64url);
        return this.importDataFromJSON(json);
    }

    importDataFromQueryString() {
        const browserQueryObj = parseQueryObject();
        if (browserQueryObj.data)
            return this.importDataFromBase64URL(browserQueryObj.data);
        return;
    }

    async importFromClipboard() {
        return navigator.clipboard.readText().then(json => this.importDataFromJSON(json));
    }

    async initiateDataImportFromFileUpload() {
        const text = await promptUploadText();
        return this.importDataFromJSON(text);
    }

    updateBrowserURLDataQuery() {
        history.pushState({}, null, this.getDataAsQueryString());
    }
}

const controller = Controller.initialize();

createNewStopwatchButton.onclick = () => controller.createStopwatch();

// 
// Exports
// 
linkButton.onclick = () => controller.updateBrowserURLDataQuery();
copyAllButton.onclick = () => navigator.clipboard.writeText(controller.getDataAsJSON());
document.oncopy = copyAllButton.onclick; // On client copy
copyLinkButton.onclick = () => navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}${controller.getDataAsQueryString()}`);
downloadAllButton.onclick = () => controller.initiateFullDataDownload();

//
// Imports
// 
pasteButton.onclick = () => controller.importFromClipboard();
document.onpaste = pasteButton.onclick;
uploadButton.onclick = async () => controller.initiateDataImportFromFileUpload();


// Import data from query string upon initialization, if available.
controller.importDataFromQueryString();

// If nothing is imported, create a single stopwatch by default.
if (!controller.listBinding.stopwatchList.internalMap.size) {
    controller.createStopwatch();
}

// Accessible through DOM
window.controller = controller;