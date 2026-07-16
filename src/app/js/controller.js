import { listElement, createNewStopwatchButton, StopwatchElement, downloadAllButton, resetAllButton, resumeAllButton, pauseAllButton, deleteAllButton, linkButton, copyAllButton, pasteButton, uploadButton, promptEditText, promptTextInput, createDynamicTextArea, hide, promptTextInputAt, downloadText, copyLinkButton, promptUploadText, dynamicURLSwitch } from "./view.js";
import { StopwatchFunction } from "./model.js";

const queryObj = Object.fromEntries(window.location.search.replace('?', '&').split("&").filter(str => !!str).map(str => str.split('=').map(urie => decodeURI(urie))));
const fileExtension = '.swljson';

class Stopwatch {
    /** @type {Stopwatch[]} */
    static list = [];
    static registeredCount = 0;

    static register(...items) {
        this.registeredCount++;
        return this.list.push(...items);
    }

    static unregister(...items) {
        this.list = this.list.filter(item => !items.includes(item));
        return this.list.length;
    }

    static setupDownloadListener(/** @type {HTMLElement} */ textPromptPlaceholderElement, getJSON = () => '') {
        return () => promptTextInputAt(textPromptPlaceholderElement, { onfinish: (value) => downloadText(`${value}${fileExtension}`, getJSON()), disabledKeys: ['Enter'] });
    }

    static {
        const listPrototype = Object.getPrototypeOf(this.list);

        listPrototype.createDefaultName = () => {
            let baseName = 'new stopwatch';
            let name = baseName;
            if (this.registeredCount) {
                let count = this.registeredCount;
                name = `${baseName} (${count})`;
                // If any instance shares the name, increment count until no match is found.
                while (this.list.some((instance) => instance.model.name === name)) {
                    name = `${baseName} (${++count})`;
                };
            }
            return name;
        }

        listPrototype.asJSON = () => {
            return JSON.stringify(this.list.map(sw => sw.getConstructionObject(), undefined, '\t'));
        }

        listPrototype.asQueryString = function () {
            return encodeURI(`?list=${Stopwatch.list.asJSON()}`);
        }

        listPrototype.getByView = (/** @type {HTMLElement} */ element) => {
            for (let sw of Stopwatch.list)
                if (sw.view.element == element)
                    return sw;
            return null;
        }

        listPrototype.rearrange = function (/** @type {HTMLElement[]} */ elements) {
            let oldValue = Stopwatch.list;
            Stopwatch.list = elements.map(element => oldValue.getByView(element)).filter(sw => !!sw);
        }

        function i(f = sw => { }) {
            return () => Stopwatch.list.forEach(sw => f(sw));
        };

        // Import
        createNewStopwatchButton.onclick = Stopwatch.getStateUpdateCallback(() => new Stopwatch());
        pasteButton.onclick = () => { importFromClipboard().then(() => Stopwatch.onStateUpdate()) };
        document.onpaste = () => { importFromClipboard().then(() => Stopwatch.onStateUpdate()) };
        uploadButton.onclick = async () => {
            const file = await promptUploadText();
            await importListFromJSON(file);
            Stopwatch.onStateUpdate();
        };

        // Controls
        resetAllButton.onclick = Stopwatch.getStateUpdateCallback(i(sw => sw.reset()));
        pauseAllButton.onclick = Stopwatch.getStateUpdateCallback(i(sw => sw.pause()));
        resumeAllButton.onclick = Stopwatch.getStateUpdateCallback(i(sw => sw.resume()));
        deleteAllButton.onclick = Stopwatch.getStateUpdateCallback(i(sw => sw.remove()));

        // Export
        function copyAll() { navigator.clipboard.writeText(Stopwatch.list.asJSON()) }
        linkButton.onclick = () => this.updateURL();
        copyAllButton.onclick = () => copyAll();
        document.oncopy = (e) => copyAll();
        copyLinkButton.onclick = () => navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}${Stopwatch.list.asQueryString()}`);
        downloadAllButton.onclick = this.setupDownloadListener(downloadAllButton, () => this.list.asJSON());
    }

    static createNew({ name = null, time = 0, lastResumed = undefined } = {}) {
        return new Stopwatch(name, time, lastResumed);
    }

    static fromJSON(jsonString) {
        return this.createNew(JSON.parse(jsonString));
    }

    static updateURL() {
        history.pushState({}, null, this.list.asQueryString());
    }

    static onStateUpdate() {
        if (dynamicURLSwitch.checkboxElement.checked)
            this.updateURL();
    }

    static getStateUpdateCallback(updateState = (...args) => { }) {
        return ((...args) => {
            updateState(...args);
            this.onStateUpdate();
        }).bind(this);
    }

    constructor(name = null, initialTime = 0, lastResumed = undefined) {
        if ([null, undefined].includes(name))
            name = Stopwatch.list.createDefaultName();

        this.model = new StopwatchFunction(name, initialTime, lastResumed);
        let view = this.view = new StopwatchElement(listElement, name, () => this.model.time, () => this.model.isActive);
        view.dragEnable(listElement);

        // Export/save
        view.ondownload = Stopwatch.setupDownloadListener(view.downloadButton, () => this.asJSONList());
        view.oncopy = () => this.copy();

        // State Update
        view.onresume = Stopwatch.getStateUpdateCallback(this.resume.bind(this));
        view.onpause = Stopwatch.getStateUpdateCallback(this.pause.bind(this));
        view.onreset = Stopwatch.getStateUpdateCallback(this.reset.bind(this));
        view.ondelete = Stopwatch.getStateUpdateCallback(this.remove.bind(this));
        view.onrename = Stopwatch.getStateUpdateCallback(this.rename.bind(this));
        view.onrearrange = Stopwatch.getStateUpdateCallback(Stopwatch.list.rearrange);

        // Update URL upon the activation of Dynamic URL
        dynamicURLSwitch.checkboxElement.addEventListener('change', function (e) {
            if (e.target.checked)
                Stopwatch.updateURL();
        });
        Stopwatch.register(this);
    }

    rename(value) {
        this.model.name = value;
        this.view.name = value;
        console.log(this.model);
    }

    pause() {
        this.model.pause();
        this.view.stop();
    }

    resume() {
        this.model.resume();
        this.view.start();
    }

    reset() {
        this.model.reset();
        this.view.updateView();
    }

    remove() {
        this.model.pause();
        this.view.remove();
        this.unregister();
    }

    download() {
        console.log(this.toJSON());
    }

    copy() {
        return navigator.clipboard.writeText(this.asJSONList());
    }

    unregister() {
        Stopwatch.unregister(this);
    }

    getConstructionObject() {
        return {
            name: this.model.name,
            time: this.model.time,
            lastResumed: this.model.lastResumed
        };
    }

    toJSON() {
        return JSON.stringify(this.getConstructionObject(), undefined, "\t");
    }

    asJSONList() {
        return JSON.stringify([this.getConstructionObject(), undefined, "\t"]);
    }
}

function importListFromJSON(json) {
    if (!json) return null;
    try {
        return JSON.parse(json).map(args => Stopwatch.createNew(args));
    } catch (error) {
        return null;
    }
}

function importFromQuery() {
    return importListFromJSON(queryObj.list);
}

async function importFromClipboard() {
    return navigator.clipboard.readText().then(text => importListFromJSON(text));
}

importFromQuery();

if (!Stopwatch.list.length)
    new Stopwatch();