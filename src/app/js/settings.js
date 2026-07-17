import { defaultStateUpdateCbFn } from "./utils.js";

export class StopwatchConfiguration {
    static DEFAULT_SETTINGS = { dynamicURL: true, concurrency: false };

    constructor(
        settings = StopwatchConfiguration.DEFAULT_SETTINGS,
        onStateUpdate = defaultStateUpdateCbFn
    ) {
        this.settings = {
            ...StopwatchConfiguration.DEFAULT_SETTINGS,
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