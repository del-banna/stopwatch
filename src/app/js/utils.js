export function setupDownloadListener(/** @type {HTMLElement} */ textPromptPlaceholderElement, getJSON = () => '') {
    return () => promptTextInputAt(textPromptPlaceholderElement, { onfinish: (value) => downloadText(`${value}${stopwatchFileExtension}`, getJSON()), disabledKeys: ['Enter'] });
}

export function toJSONP(obj) {
    return JSON.stringify(obj, undefined, "\t");
}

export function generateHex8() {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    // Convert the 32-bit unsigned integer to a hex string and pad with leading zeros
    return arr[0].toString(16).padStart(8, '0');
}