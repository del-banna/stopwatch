import { StopWatch } from "./model.js";

export function formatTime(milliseconds) {
    let d = new Date(milliseconds + (new Date().getTimezoneOffset() * 60 * 1000));
    function pad(n, length) {
        n = `${n}`;
        let len = n.length;
        return len < length ? "0".repeat(length - len) + n : n;
    }
    return [...[d.getHours(), d.getMinutes(), d.getSeconds()].map(n => pad(n, 2)), pad(d.getMilliseconds(), 3)].join(":");
}

export const materialDesign = {
    className: "material-symbols-outlined",
    icons: {
        drag: 'drag_indicator',
        play: 'play_arrow',
        reset: 'history',
        pause: 'pause',
        delete: 'delete',
        add: 'add_circle'
    }
}

export function createElement(tag, attributes = null, parent = document.body) {
    /** @type {HTMLElement} */
    let element = document.createElement(tag);
    if (attributes)
        Object.entries(attributes).forEach(entry => element.setAttribute(...entry));
    if (parent)
        parent.appendChild(element);
    return element;
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

export function promptEditText(/** @type {HTMLElement} */ element, onedit = (oldValue, newValue) => true) {
    function getRows(text) {
        return text.split("\n").length;
    }

    let index = getIndexOf(element);
    let parent = element.parentElement;
    let field = createElement("textarea", { rows: getRows(element.innerText), wrap: "off" }, null);
    field.value = element.innerText;

    function swap() {
        let couple = [field, element];
        let current = couple.filter(x => !!x.parentElement)[0];
        let other = couple.filter(x => x != current)[0];
        current.remove();
        insertElementAt(other, parent, index);
        return;
    }

    function finalize() {
        if (onedit(element.innerText, field.value))
            element.innerText = field.value;
        swap();
        return;
    }

    field.onkeyup = function (event) {
        field.rows = getRows(field.value);
        return;
    }

    field.onkeydown = function (event) {
        if (event.key == "Escape") { swap(); return; }
        if (event.key != "Enter") return;
        if (!event.ctrlKey) return;

        finalize();
        return false;
    }

    swap();
    return;
}

export function makeTextEditable(/** @type {HTMLElement} */ element, onedit = (oldValue, newValue) => true) {
    element.onclick = () => promptEditText(element, onedit);
}

export function createMaterialIcon(text, parent = null, additionalAttributes = {}, additionalStyleClasses = []) {
    let icon = createElement("div", { class: `${materialDesign.className} ${additionalStyleClasses.join(" ")}`, ...additionalAttributes }, parent);
    icon.innerText = text;
    return icon;
}

export function createStopwatchElement(parent = null, name = "", getTime = () => 0, isActive = () => false, onrename = (newName) => { }, onresume = () => true, onpause = () => true, onreset = () => true, onremove = () => true) {
    let stopWatchElement = createElement("li", { class: "stopwatch", draggable: false }, parent);
    let ia = 'ia', iaa = 'iaa', iax = 'iax';
    let ia1 = [ia, iax];

    let dragElement = createMaterialIcon(materialDesign.icons.drag, stopWatchElement, { id: 'drag' }, [iaa, "stopwatch-drag-target"]);
    let nameElement = createElement("div", { class: iaa + " " + iax, id: 'name' }, stopWatchElement);
    let timeElement = createElement("div", { id: 'time' }, stopWatchElement);
    let resetElement = createMaterialIcon(materialDesign.icons.reset, stopWatchElement, { id: 'reset' }, [...ia1, 'yellow']);
    let resumeElement = createMaterialIcon(materialDesign.icons.play, stopWatchElement, { id: 'resume' }, [...ia1, 'green']);
    let pauseElement = createMaterialIcon(materialDesign.icons.pause, null, { id: 'pause' }, [...ia1, 'blue']);
    let deleteElement = createMaterialIcon(materialDesign.icons.delete, stopWatchElement, { id: 'delete' }, [...ia1, 'red']);

    nameElement.innerText = name;
    makeTextEditable(nameElement, (oldValue, newValue) => onrename(newValue));

    let pausePlayIndex = getIndexOf(resetElement) + 1;
    let interval = null;

    function updateTime() {
        timeElement.innerText = formatTime(getTime());
    }

    function updatePausePlay() {
        if (isActive()) {
            resumeElement.remove();
            insertElementAt(pauseElement, stopWatchElement, pausePlayIndex);
        } else {
            pauseElement.remove();
            insertElementAt(resumeElement, stopWatchElement, pausePlayIndex);
        }
    }

    function resume() {
        if (!onresume()) return;
        if (!interval)
            interval = setInterval(() => updateTime(), 1);
        updatePausePlay();
    }

    function pause() {
        if (!onpause()) return;
        if (interval)
            clearInterval(interval);
        interval = null;
        updatePausePlay();
    }

    function reset() {
        if (!onreset()) return;
        updateTime();
    }

    function remove() {
        if (!onremove()) return;
        pause();
        stopWatchElement.remove();
    }

    function dragEnable(/** @type {HTMLUListElement} */ list) {
        stopWatchElement.draggable = true;

        stopWatchElement.ondrag = function ({ clientX: x, clientY: y }) {
            stopWatchElement.classList.add("dragging");
            let swapTarget = document.elementFromPoint(x, y);
            if (!swapTarget || list !== swapTarget.parentNode) return;
            swapTarget = swapTarget !== stopWatchElement.nextSibling ? swapTarget : swapTarget.nextSibling;
            list.insertBefore(stopWatchElement, swapTarget);
            return;
        };

        stopWatchElement.ondragend = function (event) {
            stopWatchElement.classList.remove("dragging");
        };
    }


    resumeElement.onclick = () => resume();
    pauseElement.onclick = () => pause();
    resetElement.onclick = () => reset();
    deleteElement.onclick = () => remove();

    updateTime();

    return stopWatchElement.StopWatch = { stopWatchElement, dragElement, nameElement, timeElement, resetElement, resumeElement, pauseElement, deleteElement, resume, pause, reset, remove, updateTime, dragEnable };
}

export const stopwatchListElement = document.querySelector('#stopwatches');
export const addStopwatchButton = document.querySelector('#add');