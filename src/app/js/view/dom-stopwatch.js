import { formatTime } from "../utils.js";
import { createElement, getIndexOf, makeTextEditable, insertElementAt } from "./dom-utils.js";
import { materialDesign, createMaterialIcon, iaa, ia_common2, iax, left, right } from "./view.js";

export class StopwatchElement {
    constructor(parent = null, name = "", getTime, isActive, { id = undefined, oncopy = () => { }, onrename = (newValue) => { }, onresume = () => true, onpause = () => true, onreset = () => true, ondelete = () => true, ondownload = () => { } } = {}) {
        this.getTime = getTime;
        this.isActive = isActive;
        this.id = id;
        this.onrename = onrename;
        this.onresume = onresume;
        this.onpause = onpause;
        this.onreset = onreset;
        this.ondelete = ondelete;
        this.ondownload = ondownload;
        this.oncopy = oncopy;

        this.element = createElement("li", { id, attributes: { draggable: false, type: "stopwatch" }, classList: ["stopwatch"], parent });
        parent = this.element;
        this.dragTargetElement = createMaterialIcon(materialDesign.icons.drag, { id: 'drag', classList: [iaa, "stopwatch-drag-target"], parent });
        this.downloadButton = createMaterialIcon(materialDesign.icons.download, { id: 'download', classList: [iaa], parent });
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

    dragEnable(/** @type {HTMLUListElement} */ list, onrearrange = (/**@type {HTMLElement[]}*/ arr) => { }) {
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
            onrearrange(Array.from(list.children));
        };
    }
}
