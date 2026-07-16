import { listElement, createNewStopwatchButton, StopwatchElement, downloadAllButton, resetAllButton, resumeAllButton, pauseAllButton, deleteAllButton, linkButton, copyAllButton, pasteButton, uploadButton, promptEditText, promptTextInput, createDynamicTextArea, hide, promptTextInputAt, downloadText, copyLinkButton, promptUploadText } from "./view.js";
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
        createNewStopwatchButton.onclick = () => new Stopwatch();
        pasteButton.onclick = () => importFromClipboard();
        document.onpaste = e => importListFromJSON(e.clipboardData.getData('text'));
        uploadButton.onclick = () => promptUploadText().then((value) => importListFromJSON(value));

        // Controls
        resetAllButton.onclick = i(sw => sw.reset());
        pauseAllButton.onclick = i(sw => sw.pause());
        resumeAllButton.onclick = i(sw => sw.resume());
        deleteAllButton.onclick = i(sw => sw.remove());

        // Export
        linkButton.onclick = () => history.pushState({}, null, this.list.asQueryString());
        function copyAll() { navigator.clipboard.writeText(Stopwatch.list.asJSON()) }
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

    constructor(name = null, initialTime = 0, lastResumed = undefined) {
        if ([null, undefined].includes(name))
            name = Stopwatch.list.createDefaultName();

        this.model = new StopwatchFunction(name, initialTime, lastResumed);
        let view = this.view = new StopwatchElement(listElement, name, () => this.model.time, () => this.model.isActive);

        view.onresume = this.resume.bind(this);
        view.onpause = () => this.pause();
        view.onreset = () => this.reset();
        view.ondelete = () => this.remove();
        view.ondownload = Stopwatch.setupDownloadListener(view.downloadButton, () => this.asJSONList());
        view.onrename = (newName) => this.rename(newName);
        view.oncopy = () => this.copy();
        view.onrearrange = (arr) => { Stopwatch.list.rearrange(arr) };
        view.dragEnable(listElement);

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

function exportAsURL() {

}

function importFromQuery() {
    return importListFromJSON(queryObj.list);
}

function importFromClipboard() {
    navigator.clipboard.readText().then(text => importListFromJSON(text));
}

importFromQuery();

if (!Stopwatch.list.length)
    new Stopwatch();