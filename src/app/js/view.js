const toMillis = (() => {
    const milli = 1;
    const second = 1000 * milli;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;
    return { milli, second, minute, hour, day };
})();

export function formatTime(milliseconds) {
    let flr = Math.floor

    let hours = flr(milliseconds / toMillis.hour);
    milliseconds -= (toMillis.hour * hours);

    let minutes = flr(milliseconds / toMillis.minute);
    milliseconds -= (toMillis.minute * minutes);

    let seconds = flr(milliseconds / toMillis.second);
    milliseconds -= (toMillis.second * seconds);

    function pad(n, length) {
        n = '' + n;
        let len = n.length;
        return len < length ? "0".repeat(length - len) + n : n;
    }
    return [...[hours, minutes, seconds].map(n => pad(n, 2)), pad(milliseconds, 3)].join(":");
}

export const materialDesign = {
    className: "material-symbols-outlined",
    icons: {
        drag: 'drag_indicator',
        play: 'play_arrow',
        reset: 'history',
        pause: 'pause',
        delete: 'delete',
        add: 'add_circle',
        delete_all: 'delete_sweep',
        pause_all: 'pause_circle',
        resume_all: 'play_circle',
        reset_all: 'history',
        download: 'download',
        upload: 'upload_file',
        link: 'link',
        copy: 'content_copy',
        paste: 'content_paste',
        copy_all: 'copy_all',
        copy_link: 'share'
    }
}

export function createElement(tag, { attributes = null, classList = [], parent = document.body, id = null, innerText = null } = {}) {
    /** @type {HTMLElement} */
    let element = document.createElement(tag);
    if (attributes)
        Object.entries(attributes).forEach(entry => element.setAttribute(...entry));
    if (id)
        element.id = id;
    if (classList)
        element.classList.add(...classList);
    if (parent)
        parent.appendChild(element);
    if (innerText)
        element.innerText = innerText;
    return element;
}

export function createMaterialIcon(text, { attributes = null, classList = [], parent = null, id = null, tag = "div" } = {}) {
    let icon = createElement(tag, { attributes, classList: [materialDesign.className, ...classList], parent, id });
    icon.innerText = text;
    return icon;
}

export function createSwitchElement({ label = null, id = null, classList = [], parent = null, attributes = {}, defaultBorder = true } = {}) {
    const labelElement = createElement("label", { id: `${id}-label`, innerText: label, parent, classList: ["label-default-border", ...classList] });
    const checkboxElement = createElement('input', { id, classList, parent: labelElement, attributes: { type: "checkbox", ...attributes } });
    return { labelElement, checkboxElement };
}

export function downloadText(filename, textContent) {
    let anchor = createElement('a', { attributes: { href: `data:text/plain;charset=utf-8,${encodeURIComponent(textContent)}`, download: filename } });
    anchor.click();
    return anchor;
}

export async function promptUploadText() {
    return new Promise((resolve, reject) => {
        let input = createElement('input', { attributes: { type: 'file' }, parent: null });
        input.onchange = (event) => {
            let reader = new FileReader();
            reader.readAsText(event.target.files[0], 'UTF-8');
            reader.onload = (readerEvent) => resolve(readerEvent.target.result);
        }
        input.click();
    });
}

export function getIndexOf(/** @type {HTMLElement} */ element) {
    return Array.from(element.parentElement.children).indexOf(element);
}

export function getSiblingOf(/** @type {HTMLElement} */ element, offset = 1) {
    return element.parentElement.children[getIndexOf(element) + offset];
}

export function insertElementAt(/** @type {HTMLElement} */ element, /** @type { HTMLElement } */ parent, index) {
    let children = Array.from(parent.children);
    if (children.length > index) {
        parent.insertBefore(element, children[index]);
        return;
    }
    parent.appendChild(element);
    return;
}

export function moveElementAmongSiblings(/** @type {HTMLElement} */ element, indexOffset) {
    insertElementAt(element, element.parentElement, Math.min(element.parentElement.children.length - 1, Math.max(0, getIndexOf(element) + indexOffset)));
}


export function createDynamicTextArea({ attributes = null, classList = ['unresizable'], parent = document.body, id = null, initialValue = "", wrap = 'off', disabledKeys = [] } = {}) {
    function getRows(text) {
        return text.split("\n").length;
    }

    let textarea = createElement('textarea', { attributes: { rows: getRows(initialValue), wrap, ...attributes }, classList, parent, id });
    textarea.value = initialValue;

    textarea.onkeyup = (event) => {
        textarea.rows = getRows(textarea.value);
        return true;
    }

    textarea.onkeydown = (event) => {
        if (disabledKeys.length && disabledKeys.includes(event.key)) return false;
        return true;
    }

    return textarea;
}


export function promptTextInput(/** @type {HTMLInputElement} */ input, onfinish = (value) => true, oncancel = (value) => { }) {
    function surr(f, event) { return f ? f(event) : true };

    let onkeydown = surr.bind(input, input.onkeydown);
    let onkeyup = surr.bind(input, input.onkeyup);

    function end(accept) {
        input.remove();
        return (accept ? onfinish : oncancel)(input.value);
    }

    let cancel = end.bind(this, false);
    let accept = end.bind(this, true);

    input.onkeyup = function (event) {
        return onkeyup(event);
    }

    input.onkeydown = function (event) {
        if (event.key == "Escape") { cancel(); return false; }
        if (event.ctrlKey && event.key == "Enter") {
            accept();
            return false;
        }

        return onkeydown(event);
    }

    return { input, end, accept, cancel };
}

export function hide(/** @type {HTMLElement} */ element) {
    let parent = element.parentElement;
    let index = getIndexOf(element);
    element.remove();

    function insert(element) {
        insertElementAt(element, parent, index);
    }

    function restore() {
        insert(element);
    }

    return { element, index, parent, insert, restore };
}

export function promptTextInputAt(/** @type {HTMLElement} */ placeholderElement, { onfinish = (value) => true, oncancel = (value) => false, initialValue = '', id = null, attributes = null, classList = ['unresizable'], wrap = 'off', disabledKeys = [] } = {}) {
    let placeholder = hide(placeholderElement);
    let input = createDynamicTextArea({ id, attributes, classList, wrap, disabledKeys, initialValue });
    let end = (f) => {
        return (value) => {
            placeholder.restore();
            return f(value);
        }
    }
    placeholder.insert(input);
    return { placeholder, prompt: promptTextInput(input, end(onfinish), end(oncancel)) }
}

export function promptEditText(/** @type {HTMLElement} */ element, { onedit = (oldValue, newValue) => true, id = null, attributes = null, classList = ['unresizable'], wrap = 'off', disabledKeys = [] } = {}) {
    let oldValue = element.innerText;
    let onfinish = (newValue) => {
        element.innerText = newValue;
        return onedit(oldValue, newValue);
    }
    let prompt = promptTextInputAt(element, { onfinish, initialValue: oldValue, id, attributes, classList, wrap, disabledKeys });

    return { element, oldValue, prompt };
}


export function makeTextEditable(/** @type {HTMLElement} */ element, onfinish = (oldValue, newValue) => true) {
    element.onclick = () => promptEditText(element, { onedit: onfinish });
}



const ia = 'ia',
    iaa = 'iaa',
    iax = 'iax',
    green = 'green',
    yellow = 'yellow',
    blue = 'blue',
    red = 'red',
    left = "left",
    middle = 'middle',
    right = 'right',
    ia_common1 = [iaa, iax],
    ia_common2 = [ia, iax];


export class StopwatchElement {
    constructor(parent = null, name = "", getTime, isActive, { oncopy = () => { }, onrename = (newValue) => { }, onresume = () => true, onpause = () => true, onreset = () => true, ondelete = () => true, ondownload = () => { }, onrearrange = (arr) => { } } = {}) {
        this.getTime = getTime;
        this.isActive = isActive;
        this.onrename = onrename;
        this.onresume = onresume;
        this.onpause = onpause;
        this.onreset = onreset;
        this.ondelete = ondelete;
        this.ondownload = ondownload;
        this.onrearrange = onrearrange;
        this.oncopy = oncopy;

        this.element = createElement("li", { attributes: { draggable: false }, classList: ["stopwatch"], parent });
        parent = this.element;
        this.dragTargetElement = createMaterialIcon(materialDesign.icons.drag, { id: 'drag', classList: [iaa, "stopwatch-drag-target"], parent });
        this.downloadButton = createMaterialIcon(materialDesign.icons.download, { id: 'download', classList: [iaa], parent })
        this.copyButton = createMaterialIcon(materialDesign.icons.copy, { id: 'copy', classList: [iaa], parent });
        this.timeElement = createElement("div", { id: 'time', parent, classList: [] });
        this.resetButton = createMaterialIcon(materialDesign.icons.reset, { id: 'reset', classList: [...ia_common2, 'yellow'], parent });
        this.resumeButton = createMaterialIcon(materialDesign.icons.play, { id: 'resume', classList: [...ia_common2, 'green'], parent });
        this.pauseButton = createMaterialIcon(materialDesign.icons.pause, { id: 'pause', classList: [...ia_common2, 'blue'], parent: null });
        this.nameElement = createElement("div", { id: 'name', innerText: name, classList: [iaa, iax, left], parent });
        this.deleteButton = createMaterialIcon(materialDesign.icons.delete, { id: 'delete', classList: [...ia_common2, 'red', right], parent });

        this.pausePlayIndex = getIndexOf(this.resetButton) + 1;

        this.viewUpdateLoop = {
            active: false,
            update: () => {
                // loop
                requestAnimationFrame(() => {
                    this.updateView();
                    if (this.viewUpdateLoop.active)
                        this.viewUpdateLoop.update();
                });
            },
            start: () => {
                if (this.viewUpdateLoop.active) return;
                this.viewUpdateLoop.active = true;
                this.viewUpdateLoop.update();
            },
            stop: () => {
                this.viewUpdateLoop.active = false;
            }
        };

        makeTextEditable(this.nameElement, (oldValue, newValue) => this.onrename(newValue));

        this.resumeButton.onclick = () => this.onresume();
        this.pauseButton.onclick = () => this.onpause();
        this.resetButton.onclick = () => this.onreset();
        this.deleteButton.onclick = () => this.ondelete();
        this.downloadButton.onclick = () => this.ondownload();
        this.copyButton.onclick = () => this.oncopy();

        this.syncState();
    }

    get name() {
        return this.nameElement.innerText;
    }

    set name(value) {
        this.nameElement.innerText = value;
    }

    updateTimeDisplay() {
        this.timeElement.innerText = formatTime(this.getTime());
    }

    updateButtons() {
        let buttons = [this.pauseButton, this.resumeButton];
        let toBeAdded = this.isActive() ? this.pauseButton : this.resumeButton;
        let toBeRemoved = buttons.filter(b => b != toBeAdded)[0];

        if (!(toBeRemoved && toBeAdded && toBeRemoved.parentElement))
            return;

        insertElementAt(toBeAdded, toBeRemoved.parentElement, this.pausePlayIndex);
        toBeRemoved.remove();
    }

    updateView() {
        this.updateButtons();
        this.updateTimeDisplay();
    }


    start() {
        this.viewUpdateLoop.start();
    }

    stop() {
        this.viewUpdateLoop.stop();
        this.updateView();
    }

    syncState() {
        this.updateView();
        if (this.isActive())
            this.start();
        else
            this.stop();
    }

    remove() {
        this.stop();
        this.element.remove();
    }

    dragEnable(/** @type {HTMLUListElement} */ list) {
        self = this;
        let element = this.element;
        element.draggable = true;

        element.ondrag = function ({ clientX: x, clientY: y }) {
            element.classList.add("dragging");
            let swapTarget = document.elementFromPoint(x, y);
            if (!swapTarget || list !== swapTarget.parentNode) return;
            swapTarget = swapTarget !== element.nextSibling ? swapTarget : swapTarget.nextSibling;
            list.insertBefore(element, swapTarget);
            return;
        };

        element.ondragend = function (event) {
            element.classList.remove("dragging");
            self.onrearrange(Array.from(list.children));
        };
    }
}


export const wrapper = createElement("div", { id: "wrapper", classList: ['container'], parent: document.body });

parent = wrapper;
export const listElement = createElement("ul", { id: "list", classList: ['container'], parent });
export const controlsDiv = createElement("div", { id: "controls", classList: ['flex'], parent });

parent = createElement("div", { parent: controlsDiv, id: "add", classList: ['left', 'vc-container'] });
export const createNewStopwatchButton = createMaterialIcon(materialDesign.icons.add, { id: "createNew", classList: ia_common1, parent });
export const pasteButton = createMaterialIcon(materialDesign.icons.paste, { id: "paste", classList: ia_common1, parent });
export const uploadButton = createMaterialIcon(materialDesign.icons.upload, { id: 'import', classList: ia_common1, parent });

parent = createElement("div", { parent: controlsDiv, id: "collectiveControl", classList: ['middle', 'vc-container'] });
export const resetAllButton = createMaterialIcon(materialDesign.icons.reset_all, { id: 'resetAll', classList: [...ia_common2, yellow], parent });
export const resumeAllButton = createMaterialIcon(materialDesign.icons.resume_all, { id: 'resumeAll', classList: [...ia_common2, green], parent });
export const pauseAllButton = createMaterialIcon(materialDesign.icons.pause_all, { id: 'pauseAll', classList: [...ia_common2, blue], parent });
export const deleteAllButton = createMaterialIcon(materialDesign.icons.delete_all, { id: 'deleteAll', classList: [...ia_common2, red], parent });

parent = createElement("div", { parent: controlsDiv, id: "export", classList: ['right', 'vc-container'] });
export const dynamicURLSwitch = createSwitchElement({ id: "dynamicLinkSwitch", label: "Dynamic URL", classList: ia_common1, parent });
export const linkButton = createMaterialIcon(materialDesign.icons.link, { id: "link", classList: ia_common1, parent });
export const copyAllButton = createMaterialIcon(materialDesign.icons.copy_all, { id: "copyAll", classList: ia_common1, parent });
export const copyLinkButton = createMaterialIcon(materialDesign.icons.copy_link, { id: "copyLink", classList: ia_common1, parent });
export const downloadAllButton = createMaterialIcon(materialDesign.icons.download, { id: "export", classList: ia_common1, parent });
