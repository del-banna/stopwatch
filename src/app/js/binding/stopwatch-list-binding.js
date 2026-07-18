import { toJSONP } from "../utils.js";
import { resumeAllButton, pauseAllButton, resetAllButton, deleteAllButton } from "../view/view.js";
import { StopwatchList } from "../model/stopwatch-list.js";


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
}
