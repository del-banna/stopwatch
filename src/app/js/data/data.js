import { validateSchema } from "./json-schema.js";
import { Configuration } from "../model/configuration.js";
import { Stopwatch } from "../model/stopwatch.js";
import { toJSONP } from "../utils.js";


/*

JSON Object Structure

{
    "title": "StopwatchJS",
    "settings": {
        "dynamicURL": true,
        "concurrency": false
    },
    "stopwatches": [
        {
            "name": "new stopwatch",
            "time": 0
        },
        {
            "name": "new stopwatch (1)",
            "time": 0
        }
    ]
}

Partial imports and exports may omit operation-irrelevant or untargetted parts while obeying the base structure.
Example of a partial import for a single stopwatch:
{
    "stopwatches": [
        {
            "name": "new stopwatch (2)",
            "time": 0
        }
    ]
}

*/

export const DATA_OBJECT_SCHEMA = {
    title: {
        type: "string",
        required: false,
        default: "title"
    },
    settings: {
        type: "object",
        required: false,
        default: { ...Configuration.DEFAULT_SETTINGS },
        properties: Configuration.SCHEMA
    },
    stopwatches: {
        type: "array",
        required: false,
        default: [],
        items: {
            type: "object",
            properties: Stopwatch.SCHEMA
        }
    }
}

export function constructDataObject(
    title = undefined,
    /**@type {Object} */settings = undefined,
    /**@type {Stopwatch[]} */stopwatchArray = undefined
) {
    const obj = {};
    if (title) {
        obj.title = title
    }
    if (settings) {
        obj.settings = { ...settings };
    }
    if (stopwatchArray) {
        obj.stopwatches = [...stopwatchArray.map(s => s.getConstructionObject())].sort((a, b) => a.index - b.index);
    }

    return obj;
}

export function toDataObjectJSON(
    title = undefined,
    /**@type {Object} */ settings = undefined,
    /**@type {Stopwatch[]} */stopwatchArray = undefined
) {
    return toJSONP(constructDataObject(title, settings, stopwatchArray.sort((a, b) => a.index - b.index)));
}

export function parseDataObjectJSON(json) {
    const obj = validateSchema(JSON.parse(json), DATA_OBJECT_SCHEMA);
    // Sort the parsed array by index
    if (!!obj && !!obj.stopwatches)
        obj.stopwatches = obj.stopwatches.sort((a, b) => a.index - b.index);
    return obj;
}