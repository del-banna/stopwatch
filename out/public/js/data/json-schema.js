// Note: I generated this with Gemini.

/**
 * Validates an input object against a schema definition.
 * Throws an Error if validation fails, otherwise returns the validated object.
 */
export function validateSchema(data, schema, path = "") {
    if (data === null || typeof data !== "object") {
        throw new TypeError(`Validation failed: Expected an object at "${path || "root"}", got ${typeof data}`);
    }

    const validated = {};

    for (const [key, rule] of Object.entries(schema)) {
        const currentPath = path ? `${path}.${key}` : key;
        const val = data[key];

        // 1. Check for missing required fields
        if (val === undefined) {
            if (rule.required !== false) {
                throw new TypeError(`Validation failed: Missing required property "${currentPath}"`);
            }
            // If optional and missing, assign the default value or skip
            if ("default" in rule) {
                validated[key] = rule.default;
            }
            continue;
        }

        // 2. Validate Type
        if (rule.type === "array") {
            if (!Array.isArray(val)) {
                throw new TypeError(`Validation failed: Property "${currentPath}" must be an array`);
            }
            // Validate array items if item rules are defined
            if (rule.items) {
                validated[key] = val.map((item, index) => {
                    if (typeof rule.items === "object" && rule.items.type === "object") {
                        return validateSchema(item, rule.items.properties, `${currentPath}[${index}]`);
                    } else {
                        if (typeof item !== rule.items) {
                            throw new TypeError(`Validation failed: Array item at "${currentPath}[${index}]" must be of type "${rule.items}"`);
                        }
                        return item;
                    }
                });
            } else {
                validated[key] = val;
            }
        } else if (rule.type === "object") {
            // Recursively validate nested objects
            validated[key] = validateSchema(val, rule.properties, currentPath);
        } else {
            // Primitive types validation (string, number, boolean)
            if (typeof val !== rule.type) {
                throw new TypeError(`Validation failed: Property "${currentPath}" must be of type "${rule.type}" (got ${typeof val})`);
            }
            validated[key] = val;
        }
    }

    return validated;
}