import { validateSchema } from "./json-schema.js";
import { Configuration } from "../model/configuration.js";
import { Stopwatch } from "../model/stopwatch.js";
import { decodeBase64Url, encodeBase64Url, toJSONP } from "../utils.js";


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

export class AppData {
    static DATA_SCHEMA = {
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

    static fromObject(object) {
        try {
            let validated = validateSchema(object, this.DATA_SCHEMA);

            if (validated.stopwatches && validated.stopwatches.length) {
                validated.stopwatches = validated.stopwatches.map(data => Stopwatch.createNew(data));
            }

            return new AppData(validated.title, validated.settings, validated.stopwatches);
        } catch (err) {
            console.warn(`Failed to import data from object: \n\t${object}`);
            console.error(err);
            return null;
        }

        return new AppData(obj.title, obj.settings,)
    }

    static fromJSON(json, createStopwatch = (stopwatchData = {}) => Stopwatch.createNew(stopwatchData)) {
        try {
            let rawObj = JSON.parse(json);
            return this.fromObject(rawObj);
        } catch (err) {
            console.warn(`Failed to import data from text/json: \n\t${json}`);
            console.error(err);
            return null;
        }

        return new AppData(obj.title, obj.settings,)
    }

    static fromBase64UrlString(base64UrlString) {
        return this.fromJSON(decodeBase64Url(base64UrlString));
    }

    static singleStopwatch(stopwatch) {
        return new AppData(undefined, undefined, [stopwatch]);
    }

    constructor(
        title = undefined,
        /**@type {Object} */ settings = undefined,
        /**@type {Stopwatch[]} */ stopwatchArray = undefined
    ) {
        this.title = title;
        this.settings = settings;
        this._stopwatches = stopwatchArray;
        this.sortStopwatches();
    }

    get stopwatches(){
        return this._stopwatches;
    }

    set stopwatches(stopwatches) {
        this._stopwatches = stopwatches;
        this.sortStopwatches();
    }

    sortStopwatches() {
        if (this.stopwatches)
            this.stopwatches.sort((a, b) => a.index - b.index);
        return this;
    }

    asObject() {
        const obj = {};
        if (this.title) {
            obj.title = this.title
        }
        if (this.settings) {
            obj.settings = { ...this.settings };
        }
        if (this.stopwatches) {
            obj.stopwatches = [...this.stopwatches.map(s => s.getConstructionObject())];
        }
        return obj;
    }

    asJSON() {
        return toJSONP(this.asObject());
    }

    asBase64UrlString() {
        return encodeBase64Url(this.asJSON());
    }

    import(/**@type {AppData}*/appData) {
        if (appData.title)
            this.title = appData.title;
        if (appData.settings)
            this.settings = { ...this.settings, ...appData.settings };
        if (appData.stopwatches)
            this.stopwatches = [...this.stopwatches, ...appData.stopwatches];
        return this;
    }

    importFromObject(object) {
        return this.import(AppData.fromObject(object));
    }

    importFromJSON(json) {
        return this.import(AppData.fromJSON(json));
    }

    importFromBase64Url(base64Url) {
        return this.import(AppData.fromBase64UrlString(base64Url));
    }
}