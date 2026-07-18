import { defaultStateUpdateCbFn } from "../utils.js";
import { concurrencySwitch, dynamicURLSwitch } from "../view/view.js";
import { Configuration } from "../model/configuration.js";


export class ConfigurationBinding {
    constructor(
    /**@type {Configuration} */ configuration,
        view = { concurrencySwitch, dynamicURLSwitch },
        onStateUpdate = defaultStateUpdateCbFn
    ) {
        this.configuration = configuration;
        this.view = view;
        this.onStateUpdate = onStateUpdate;
    }

    initialize() {
        // Inbound state updates
        this.view.dynamicURLSwitch.checkboxElement.addEventListener('change', (e) => {
            this.configuration.setDynamicURL(e.target.checked);
        });

        this.view.concurrencySwitch.checkboxElement.addEventListener('change', (e) => {
            this.configuration.setConcurrency(e.target.checked);
        });

        // Outbound state updates
        this.configuration.onStateUpdate = (propertyName, value) => {
            let viewObj = undefined;

            switch (propertyName) {
                case "dynamicURL":
                    viewObj = this.view.dynamicURLSwitch;
                    break;

                case "concurrency":
                    viewObj = this.view.concurrencySwitch;
                    break;

                default:
                    break;
            }

            if (viewObj) {
                if (!viewObj.checkboxElement.checked == value)
                    viewObj.checkboxElement.checked = value;
            }

            this.onStateUpdate(propertyName, value);
        };

        // Initial update to sync view
        this.configuration.emitPropertyStateUpdates();

        return this;
    }
}
