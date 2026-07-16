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

// Should be refactored to accomodate the new changes as a method of the Controller class
// .updateURL() {
//     history.pushState({}, null, this.asQueryString());
// }


// All initialization logic and controller logic will be self-contained and organized in the Controller class.
// Controller class will implement a singleton instance, and it will provide a static initialization method to be invoked to bootstrap everything.

//
// Initialization
//




//
// **Re-implement after refactoring
//

// **Controller logic

// onStateUpdate() {
//     if (dynamicURLSwitch.checkboxElement.checked)
//         this.updateURL();
// }


// Import
pasteButton.onclick = () => { importFromClipboard().then(() => listInstance.onStateUpdate()) };
document.onpaste = () => { importFromClipboard().then(() => listInstance.onStateUpdate()) };
uploadButton.onclick = async () => {
    const file = await promptUploadText();
    await importListFromJSON(file);
    listInstance.onStateUpdate();
};
// Update this to use the latest list method (computeNextName?)
createNewStopwatchButton.onclick = list.getStateUpdateCallback(Stopwatch.createNew({ name: list.computeNextInstanceName(), onStateUpdate: () => list.onStateUpdate(), parentList: list }));

importFromQuery();


// **Controller logic
// Export
linkButton.onclick = () => listInstance.updateURL();
copyAllButton.onclick = () => copyAll();
document.oncopy = (e) => copyAll();
copyLinkButton.onclick = () => navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}${listInstance.asQueryString()}`);
downloadAllButton.onclick = setupDownloadListener(downloadAllButton, () => listInstance.asJSON());



// **This listener belongs in the list view binding class. The list view binding class should expose an aggregate listener for all change events from the list and its individual members
// Update URL upon the activation of Dynamic URL
dynamicURLSwitch.checkboxElement.addEventListener('change', function (e) {
    if (e.target.checked)
        Stopwatch.updateURL();
});