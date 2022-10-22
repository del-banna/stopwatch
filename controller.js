import { StopWatch } from "./model.js";
import { stopwatchListElement, addStopwatchButton, createStopwatchElement } from "./view.js";

const stopwatchList = [];

function register(...items) {
    return stopwatchList.push(items);
}

function unregister(...items) {
    items.forEach(i => stopwatchList.splice(stopwatchList.indexOf(i), 1));
    return stopwatchList.length;
}

Object.getPrototypeOf(stopwatchList).createDefaultName = () => {
    let name = 'new stopwatch';
    if (stopwatchList.length)
        name += ` (${stopwatchList.length})`;
    return name;
}

function createStopWatch(name, initialTime = 0) {
    let stopwatch = new StopWatch(name, initialTime);
    let result = { stopwatch };
    let stopwatchElement = createStopwatchElement(
        stopwatchListElement,
        name,
        () => stopwatch.time,
        () => stopwatch.isActive,
        (newName) => stopwatch.name = newName,
        () => stopwatch.resume(),
        () => stopwatch.pause(),
        () => stopwatch.reset(),
        () => { stopwatch.pause(); unregister(result); return true; }
    );
    stopwatchElement.dragEnable(stopwatchListElement);
    result.element = stopwatchElement;
    register(result);
    return result;
}

addStopwatchButton.onclick = () => createStopWatch(stopwatchList.createDefaultName(), 0);
createStopWatch(stopwatchList.createDefaultName());