import { validateSchema } from "./json-schema.js";
import { Configuration } from "../model/configuration.js";
import { Stopwatch } from "../model/stopwatch.js";
import { toJSONP } from "../utils.js";


/*

JSON Object Structure

{
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
    /**@type {Object} */settings = undefined,
    /**@type {Stopwatch[]} */stopwatchArray = undefined
) {
    const obj = {};
    if (settings) {
        obj.settings = { ...settings };
    }
    if (stopwatchArray) {
        obj.stopwatches = [...stopwatchArray.map(s => s.getConstructionObject())];
    }

    return obj;
}

export function toDataObjectJSON(
    /**@type {Object} */ settings = undefined,
    /**@type {Stopwatch[]} */stopwatchArray = undefined
) {
    return toJSONP(constructDataObject(settings, stopwatchArray));
}

export function parseDataObjectJSON(json) {
    return validateSchema(JSON.parse(json), DATA_OBJECT_SCHEMA);
}