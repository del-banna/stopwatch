import { listElement, createNewStopwatchButton, downloadAllButton, linkButton, copyAllButton, pasteButton, uploadButton, copyLinkButton, dynamicURLSwitch, concurrencySwitch, titleView } from "./view/view.js";
import { constructQueryString, decodeBase64Url, encodeBase64Url, parseQueryObject, toJSONP } from "./utils.js";
import { initiateNamedDownloadPrompt, promptUploadText } from "./view/dom-utils.js";
import { Stopwatch } from "./model/stopwatch.js";
import { StopwatchList } from "./model/stopwatch-list.js";
import { Configuration } from "./model/configuration.js";
import { StopwatchBinding } from "./binding/stopwatch-binding.js";
import { StopwatchListBinding } from "./binding/stopwatch-list-binding.js";
import { ConfigurationBinding } from "./binding/configuration-binding.js";
import { AppData } from "./data/data.js";
import { validateSchema } from "./data/json-schema.js";


//
// Parameters
// 

export const initialBrowserQueryObj = parseQueryObject();
export const stopwatchFileExtension = 'swjson';
export const defaultTitle = "StopwatchJS"

function updateTabTitle(newTitle) {
    document.title = newTitle;
    window.history.replaceState(window.history.state, '', window.location.href);
}

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
            listBinding,
            defaultTitle
        );

        updateTabTitle(controller.appData.title);

        this.instance = controller;
        return controller;
    }

    constructor(
        /**@type {ConfigurationBinding} */ configurationBinding,
        /**@type {StopwatchListBinding} */ listBinding,
        title = defaultTitle
    ) {
        this.configurationBinding = configurationBinding;
        this.listBinding = listBinding;

        // A static runtime data model used as a data-manipulation utility
        this._appData = new AppData(title, configurationBinding.configuration.settings, listBinding.stopwatchList.getStopwatches());

        this.configurationBinding.onStateUpdate = (prop, val) => this.onStateUpdate(prop, val);
        this.listBinding.stopwatchList.onStateUpdate = (prop, val) => this.onStateUpdate(prop, val);
        titleView.addEditListener((oldTitle, newTitle) => {
            this.appData.title = newTitle;
            updateTabTitle(newTitle);
            this.onStateUpdate("title", newTitle);
        });
    }

    get appData() {
        this._appData = new AppData(this._appData.title, this.configurationBinding.configuration.settings, this.listBinding.stopwatchList.getStopwatches());
        return this._appData;
    }

    onStateUpdate(prop = undefined, val = undefined, data = {}) {
        const settings = this.appData.settings;

        if (!settings.concurrency && prop === "resume" && !!data.stopwatch) {
            let target = data.stopwatch;
            this.listBinding.stopwatchList.forEach(stopwatch => {
                if (stopwatch !== target && stopwatch.active)
                    stopwatch.pause();
            });
            //requires object reference. Must update onStateUpdate to pass it.
        }

        if (prop === "concurrency" && !settings.concurrency) {
            this.listBinding.stopwatchList.pauseAll();
        }

        if (settings.dynamicURL)
            this.updateBrowserURLDataQuery();
    }

    importStopwatch(/**@type {Stopwatch}*/ stopwatch) {
        const list = this.listBinding.stopwatchList;

        if (!stopwatch.name)
            stopwatch.name = list.computeNextInstanceName();

        stopwatch.index = Math.max(stopwatch.index, list.computeNextIndex());
        stopwatch.onStateUpdate = (prop, val) => this.onStateUpdate(prop, val, { stopwatch });

        const asJSON = () => AppData.singleStopwatch(stopwatch).asJSON();
        const swBinding = StopwatchBinding.createNew(
            stopwatch,
            this.listBinding,
            // onremove
            (binding) => list.remove(binding.stopwatch),
            // ondownload
            (binding) => initiateNamedDownloadPrompt(binding.element.downloadButton, asJSON(), stopwatchFileExtension),
            // oncopy
            (binding) => navigator.clipboard.writeText(asJSON())
        ).initialize();

        list.add(stopwatch);
        return swBinding;
    }

    createStopwatch({ name = undefined, previousTime = 0, lastResumed = undefined, index = -1 } = {}) {

        return this.importStopwatch(Stopwatch.createNew({ name, previousTime, lastResumed, index }));
    }

    getDataQueryString() {
        let browserQueryObj = parseQueryObject();
        browserQueryObj.data = this.appData.asBase64UrlString();
        return constructQueryString(browserQueryObj);
    }

    initiateFullDataDownload() {
        initiateNamedDownloadPrompt(downloadAllButton, this.appData.asJSON(), stopwatchFileExtension);
    }

    importData(/**@type {AppData}*/ imported) {
        let data = this.appData.import(imported);
        if (imported.settings) {
            this.configurationBinding.configuration.settings = data.settings;
            this.configurationBinding.configuration.emitPropertyStateUpdates();
        }

        if (imported.stopwatches && imported.stopwatches.length) {
            imported.stopwatches.forEach(sw => this.importStopwatch(sw));
        }

        if (imported.title) {
            updateTabTitle(data.title);
            titleView.setTitle(data.title);
        }

        return this;
    }

    importDataFromJSON(json) {
        return this.importData(AppData.fromJSON(json));
    }

    importDataFromBase64URL(base64url) {
        return this.importData(AppData.fromBase64UrlString(base64url));
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

    async initiateDataFileImport() {
        const text = await promptUploadText();
        return this.importDataFromJSON(text);
    }

    updateBrowserURLDataQuery() {
        history.pushState({}, null, this.getDataQueryString());
    }
}

const controller = Controller.initialize();

createNewStopwatchButton.onclick = () => controller.createStopwatch();

// 
// Exports
// 
linkButton.onclick = () => controller.updateBrowserURLDataQuery();
copyAllButton.onclick = () => navigator.clipboard.writeText(controller.appData.asJSON());
document.oncopy = copyAllButton.onclick; // On client copy
copyLinkButton.onclick = () => navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}${controller.getDataQueryString()}`);
downloadAllButton.onclick = () => controller.initiateFullDataDownload();

//
// Imports
// 
pasteButton.onclick = () => controller.importFromClipboard();
document.onpaste = pasteButton.onclick;
uploadButton.onclick = async () => controller.initiateDataFileImport();


// Import data from query string upon initialization, if available.
controller.importDataFromQueryString();

// If nothing is imported, create a single stopwatch by default.
if (!controller.listBinding.stopwatchList.internalMap.size) {
    controller.createStopwatch();
}

// Accessible through DOM
window.controller = controller;