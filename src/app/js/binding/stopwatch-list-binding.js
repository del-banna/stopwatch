import { toJSONP } from "../utils.js";
import { resumeAllButton, pauseAllButton, resetAllButton, deleteAllButton } from "../view/view.js";
import { StopwatchList } from "../model/stopwatch-list.js";
import { StopwatchBinding } from "./stopwatch-binding.js";


//
//
//

export class StopwatchListBinding {
    constructor(
    /**@type {StopwatchList}*/ stopwatchList,
        /**@type {HTMLElement}*/ stopwatchListElement
    ) {
        this.stopwatchList = stopwatchList;
        this.stopwatchListElement = stopwatchListElement;
    }

    initialize() {
        if (!(this.stopwatchList && this.stopwatchListElement))
            throw new Error(`Cannot activate list view binding: invalid references. \n\t${toJSONP(this)}`);

        // Inbound UI actions
        resumeAllButton.onclick = () => this.stopwatchList.resumeAll();
        pauseAllButton.onclick = () => this.stopwatchList.pauseAll();
        resetAllButton.onclick = () => this.stopwatchList.resetAll();
        deleteAllButton.onclick = () => this.stopwatchList.removeAll();

        return this;
    }

    onrearrange(/**@type {HTMLElement[]}*/ arr, /**@type {StopwatchBinding}*/ swBinding) {
        // Retrieve an array of stopwatch id's in the order they are found in the list element
        const idArr = arr.map(el =>
            (!!el.type && el.type === "stopwatch" && el.id) ? el.id : undefined
        ).filter(id => !!id);

        if (idArr.length < arr.length)
            console.warn("Rearrange warning: failed to fully parse the id's of the elements in the list.");

        const stopwatch = swBinding.stopwatch;
        if (idArr.indexOf(stopwatch.id) == -1)
            throw new Error("Failed to rearrange stopwatch list: target id was not found in parsed list.");

        // Assign each stopwatch's index as it is found in the HTML list
        for (let i = 0; i < idArr.length; i++) {
            let id = idArr[i];
            let sw = this.stopwatchList.internalMap.get(id);
            if (!sw) {
                console.warn(`Failed to retrieve stopwatch from the list's internal map by id: ${id}`);
                continue;
            }
            sw.index = i;
        }
    }
}
