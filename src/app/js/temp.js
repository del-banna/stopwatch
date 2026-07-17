
//
// **Re-implement after refactoring
//


//
// from: class Stopwatch
//

// static fromJSON(jsonString) {
//     return this.createNew(JSON.parse(jsonString));
// }

// State update callback
// getStateUpdateCallback(updateState = (...args) => { }) {
//     return ((...args) => {
//         updateState(...args);
//         this.onStateUpdate();
//     }).bind(this);
// }

// download() {
//     console.log(this.toJSON());
// }

// copy() {
//     return navigator.clipboard.writeText(this.asJSONList());
// }

//
//
//




// Split into different types of imports; strictly list-importing logic belongs in the StopwatchList class...
function importListFromJSON(json) {
    if (!json) return null;
    try {
        return JSON.parse(json).map(args => Stopwatch.createNew(args));
    } catch (error) {
        return null;
    }
}

// This is intended to serve a very specific function: to load the top-level application data. It should be refactored to accomodate the new changes as a method of the Controller class
function importFromQuery() {
    return importListFromJSON(browserQueryObj.list);
}

// There are different types of imports, and they must be differentiated. This could be an individual stopwatch import, a list import, or a top-level import and such. Must define JSON object structure for exports/imports-
// and implement partial object import support.
async function importFromClipboard() {
    return navigator.clipboard.readText().then(text => importListFromJSON(text));
}

// All initialization logic and controller logic will be self-contained and organized in the Controller class.
// Controller class will implement a singleton instance, and it will provide a static initialization method to be invoked to bootstrap everything.


// Import
pasteButton.onclick = () => { importFromClipboard().then(() => listInstance.onStateUpdate()) };
document.onpaste = () => { importFromClipboard().then(() => listInstance.onStateUpdate()) };
uploadButton.onclick = async () => {
    const file = await promptUploadText();
    await importListFromJSON(file);
    listInstance.onStateUpdate();
};

importFromQuery();


// **Controller logic
// Export
linkButton.onclick = () => listInstance.updateURL();
copyAllButton.onclick = () => copyAll();
document.oncopy = (e) => copyAll();
copyLinkButton.onclick = () => navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}${listInstance.asQueryString()}`);
downloadAllButton.onclick = setupDownloadListener(downloadAllButton, () => listInstance.asJSON());



// 
    // 
    // 
    // From: StopwatchList
    // 
    // 
    // 



    //
    // Serialization
    // 

    // Will no longer be relevant
    // asJSON() {
    //     return toJSONP(this.internalList.map(sw => sw.getConstructionObject()));
    // }

    // 
    // These will no longer be a relevant methods of the list class. It should only be concerned with serializing the list and nothing else. 
    // 
    // .asQueryString() {
    //     return encodeURI(`?list=${this.asJSON()}`);
    // }
    // 
    // .copyAll() {
    //     navigator.clipboard.writeText(this.asJSON());
    // }
    // 
    //


    //
    // Instance elements
    // 

    /** */

    /* 
    This became obsolete after the refactoring. Information about the order of stopwatches should be stored elsewhere.
    */

    // getStopwatchInstanceByElement(/** @type {HTMLElement} */ element) {
    //     for (let sw of this.internalMap)
    //         if (sw.view.element == element)
    //             return sw;
    //     return null;
    // }

    // rearrangeInstanceElements(/** @type {HTMLElement[]} */ elements) {
    //     let oldValue = this.internalMap;
    //     this.internalMap = elements.map(element => oldValue.getStopwatchInstanceByElement(element)).filter(sw => !!sw);
    // }

    // rearrange(/**@type {String[]}*/ ids) {

    // }

    /** */