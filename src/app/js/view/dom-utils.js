
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
export function createSwitchElement({ label = null, id = null, classList = [], parent = null, attributes = {}, defaultBorder = true } = {}) {
    const labelElement = createElement("label", { id: `${id}-label`, innerText: label, parent, classList: ["label-default-border", ...classList] });
    const checkboxElement = createElement('input', { id, classList, parent: labelElement, attributes: { type: "checkbox", ...attributes } });
    return { labelElement, checkboxElement };
}

export function createToggleTextBoxElement({ initialText = "", parent = document.body, id = null, classList = [], attributes = null, onedit = (oldValue, newValue) => { }, wrap = 'off', resizeable = false } = {}) {
    const readonlyElement = createElement("div", { id, parent, classList, attributes, innerText: initialText });
    let editPending = false;

    // On click, allow user to edit text content
    readonlyElement.onclick = () => {
        if (editPending)
            return;

        editPending = true;
        let initialValue = readonlyElement.innerText;

        // Create the input element without a parent
        let inputElClassList = [];
        if (!resizeable)
            inputElClassList.push("unresizable");
        let inputElement = createDynamicTextArea({ id, inputElClassList, wrap, initialValue, attributes });

        // Hide the readonlyElement and substitute it with a helper placeholder
        let placeholder = hide(readonlyElement);

        // Insert the input element into the placeholder
        placeholder.insert(inputElement);


        // Detect if user clicks outside the text box or other edit-relevant elements
        const relevantElements = [inputElement, readonlyElement];
        const clickAwayListener = (event) => {
            if (!relevantElements.includes(event.target)) {
                endEdit(true);
            }
        }

        // Detect keyboard shortcut activation
        const keyboardShortcutListener = (event) => {
            if (event.key == "Escape") {
                endEdit(false);
                return;
            }

            if (event.ctrlKey && event.key == "Enter") {
                endEdit(true);
                return;
            }
        }

        function clearListeners() {
            document.removeEventListener('click', clickAwayListener);
            document.removeEventListener('keydown', keyboardShortcutListener);
        }

        function endEdit(accept = true) {
            if (accept) {
                readonlyElement.innerText = inputElement.value;
                onedit(initialValue, inputElement.value);
            }

            clearListeners();
            inputElement.remove();
            placeholder.restore();
            editPending = false;
        }

        document.addEventListener('click', clickAwayListener);
        document.addEventListener("keydown", keyboardShortcutListener);
    };

    return readonlyElement;
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
        };
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
    };

    textarea.onkeydown = (event) => {
        if (disabledKeys.length && disabledKeys.includes(event.key)) return false;
        return true;
    };

    return textarea;
}
export function promptTextInput(/** @type {HTMLInputElement} */ input, onfinish = (value) => true, oncancel = (value) => { }) {
    function surr(f, event) { return f ? f(event) : true; };

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
    };

    input.onkeydown = function (event) {
        if (event.key == "Escape") { cancel(); return false; }
        if (event.ctrlKey && event.key == "Enter") {
            accept();
            return false;
        }

        return onkeydown(event);
    };

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


export function promptTextInputAt(/** @type {HTMLElement} */ anchorElement, { onfinish = (value) => true, oncancel = (value) => false, initialValue = '', id = null, attributes = null, classList = ['unresizable'], wrap = 'off', disabledKeys = [] } = {}) {
    let placeholder = hide(anchorElement);
    let input = createDynamicTextArea({ id, attributes, classList, wrap, disabledKeys, initialValue });
    let end = (f) => {
        return (value) => {
            placeholder.restore();
            return f(value);
        };
    };
    placeholder.insert(input);
    return { placeholder, prompt: promptTextInput(input, end(onfinish), end(oncancel)) };
}


export function promptEditText(/** @type {HTMLElement} */ element, { onedit = (oldValue, newValue) => true, id = null, attributes = null, classList = ['unresizable'], wrap = 'off', disabledKeys = [] } = {}) {
    let oldValue = element.innerText;
    let onfinish = (newValue) => {
        element.innerText = newValue;
        return onedit(oldValue, newValue);
    };
    let prompt = promptTextInputAt(element, { onfinish, initialValue: oldValue, id, attributes, classList, wrap, disabledKeys });

    return { element, oldValue, prompt };
}
export function makeTextEditable(/** @type {HTMLElement} */ element, onfinish = (oldValue, newValue) => true) {
    element.onclick = () => promptEditText(element, { onedit: onfinish });
}
export function initiateNamedDownloadPrompt(
/** @type {HTMLElement} */ textPromptAnchorElement,
    fileTextContent,
    fileExtension = ".json") {
    promptTextInputAt(
        textPromptAnchorElement,
        {
            onfinish: (fileName) => downloadText(`${fileName}.${fileExtension}`, fileTextContent),
            disabledKeys: ['Enter']
        });
}

