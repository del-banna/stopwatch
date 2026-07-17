import { defaultStateUpdateCbFn } from "./utils.js";

export class Configuration {
    static DEFAULT_SETTINGS = { dynamicURL: true, concurrency: false };
    static SCHEMA = {
        dynamicURL: { type: "boolean", required: false, default: true },
        concurrency: { type: "boolean", required: false, default: false }
    }

    constructor(
        settings = Configuration.DEFAULT_SETTINGS,
        onStateUpdate = defaultStateUpdateCbFn
    ) {
        this.settings = {
            ...Configuration.DEFAULT_SETTINGS,
            ...settings
        };
        this.onStateUpdate = onStateUpdate;
    }

    emitPropertyStateUpdates() {
        Object.entries(this.settings).forEach(([prop, val]) => this.onStateUpdate(prop, val));
    }

    setDynamicURL(value) {
        this.settings.dynamicURL = value;
        this.onStateUpdate("dynamicURL", value);
    }

    setConcurrency(value) {
        this.settings.concurrency = value;
        this.onStateUpdate("concurrency", value);
    }
}