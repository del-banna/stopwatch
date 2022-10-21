import { formatTime, StopWatch } from "./stopwatch.js";

const materialDesign = {
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

function createElement(tag, attributes = null, parent = document.body) {
    /** @type {HTMLElement} */
    let element = document.createElement(tag);
    if (attributes)
        Object.entries(attributes).forEach(entry => element.setAttribute(...entry));
    if (parent)
        parent.appendChild(element);
    return element;
}

function getIndexOf(/** @type {HTMLElement} */ element) {
    return Array.from(element.parentElement.children).indexOf(element);
}

function getSiblingOf(/** @type {HTMLElement} */ element, offset = 1) {
    return element.parentElement.children[getIndexOf(element) + offset];
}

function insertElementAt(/** @type {HTMLElement} */ element, /** @type { HTMLElement } */ parent, index) {
    let children = Array.from(parent.children);
    if (children.length > index) {
        parent.insertBefore(element, children[index]);
        return;
    }
    parent.appendChild(element);
    return;
}

function moveElementAmongSiblings(/** @type {HTMLElement} */ element, indexOffset) {
    insertElementAt(element, element.parentElement, Math.min(element.parentElement.children.length - 1, Math.max(0, getIndexOf(element) + indexOffset)));
}

function promptEditText(/** @type {HTMLElement} */ element) {
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

function makeTextEditable(/** @type {HTMLElement} */ element) {
    element.onclick = () => promptEditText(element);
}

function createMaterialIcon(text, parent = null, additionalAttributes = {}, additionalStyleClasses = []) {
    let icon = createElement("div", { class: `${materialDesign.className} ${additionalStyleClasses.join(" ")}`, ...additionalAttributes }, parent);
    icon.innerText = text;
    return icon;
}

function createStopwatch(parent = null, name = "new stopwatch") {
    let stopWatchWrapper = createElement("li", { class: "stopwatch", draggable: false }, parent);
    let ia = 'ia', iaa = 'iaa', iax = 'iax';
    let ia1 = [ia, iax];

    let dragElement = createMaterialIcon(materialDesign.icons.drag, stopWatchWrapper, { id: 'drag' }, [iaa, "stopwatch-drag-target"]);

    let nameElement = createElement("div", { class: iaa + " " + iax, id: 'name' }, stopWatchWrapper);
    nameElement.innerText = name;
    makeTextEditable(nameElement);

    let timeElement = createElement("div", { id: 'time' }, stopWatchWrapper);
    timeElement.innerText = formatTime(0);

    let resetElement = createMaterialIcon(materialDesign.icons.reset, stopWatchWrapper, { id: 'reset' }, [...ia1, 'yellow']);

    let pausePlayIndex = stopWatchWrapper.children.length;
    let resumeElement = createMaterialIcon(materialDesign.icons.play, stopWatchWrapper, { id: 'resume' }, [...ia1, 'green']);
    let pauseElement = createMaterialIcon(materialDesign.icons.pause, null, { id: 'pause' }, [...ia1, 'blue']);

    let deleteElement = createMaterialIcon(materialDesign.icons.delete, stopWatchWrapper, { id: 'delete' }, [...ia1, 'red']);
    let stopWatch = new StopWatch("");
    let interval = null;

    function updateTime() {
        timeElement.innerText = formatTime(stopWatch.time);
    }

    function updatePausePlay() {
        if (stopWatch.isActive) {
            resumeElement.remove();
            insertElementAt(pauseElement, stopWatchWrapper, pausePlayIndex);
        } else {
            pauseElement.remove();
            insertElementAt(resumeElement, stopWatchWrapper, pausePlayIndex);
        }
    }

    function start() {
        stopWatch.start();
        if (!interval)
            interval = setInterval(() => updateTime(), 1);
    }

    function stop() {
        stopWatch.stop();
        if (interval)
            clearInterval(interval);
        interval = null;
    }

    function reset() {
        stopWatch.reset();
        updateTime();
    }

    function remove() {
        stop();
        stopWatchWrapper.remove();
    }

    function dragEnable(/** @type {HTMLUListElement} */ list) {
        stopWatchWrapper.draggable = true;

        stopWatchWrapper.ondrag = function ({ clientX: x, clientY: y }) {
            stopWatchWrapper.classList.add("dragging");
            let swapTarget = document.elementFromPoint(x, y);
            if (!swapTarget || list !== swapTarget.parentNode) return;
            swapTarget = swapTarget !== stopWatchWrapper.nextSibling ? swapTarget : swapTarget.nextSibling;
            list.insertBefore(stopWatchWrapper, swapTarget);
            return;
        };

        stopWatchWrapper.ondragend = function (event) {
            stopWatchWrapper.classList.remove("dragging");
        };
    }


    resetElement.onclick = () => reset();
    resumeElement.onclick = () => { start(); updatePausePlay(); };
    pauseElement.onclick = () => { stop(); updatePausePlay(); };
    deleteElement.onclick = () => remove();

    let elements = { stopWatchDiv: stopWatchWrapper, dragElement, nameElement, timeElement, resetElement, resumeElement, pauseElement, deleteElement };
    return stopWatchWrapper.stopwatch = { elements, stopWatch, updateTime: updateTime, start, stop, reset, remove, dragEnable };
}


let stopwatches = document.querySelector('#stopwatches');
let addStopwatchDiv = document.querySelector('#add');

function addStopwatch() {
    let sw = createStopwatch(stopwatches, `new stopwatch ${stopwatches.hasChildNodes() ? `(${stopwatches.children.length})` : ""}`);
    sw.dragEnable(stopwatches);
}

addStopwatchDiv.onclick = () => addStopwatch();
addStopwatch();

