/*
    Error cases to interpret and normalize:

    A. Caught client-side exceptions (an instance of Error):
        ReferenceError: foo is not defined
    B. Other server errors (JSON):
        ["undefined method `map' for nil:NilClass"]
    C. Server validation errors (JSON):
        1. array-of-string values: {"name": ["Requires name"]}
        2. string value: {"email": "must be filled"}
        3. nested fields + array-of-string values: {"address": {"ln1": ["must be filled", "must be a street address"]}}
        4. nested fields + string values: {"address": {"ln1": "must be filled"}}
    D. Client-side validation errors (JS object with content type "v/errors"):
        [{"some_field_id": "Please fill out this field."}, ...]
    E. Other client-side errors (JS object with content type "v/errors"):
        {exception: 'Something bad happened'}
    F. Problem sending XHR
        {statusCode: 0, ...}
    G. Other server error with no data:
        {statusCode: 502, ...}
 */

/**
 * Interprets and displays errors from an action chain to the user.
 *
 * Errors are displayed under the erring field when possible, or in the closest
 * error container (a `.v-errors` <div> element) otherwise.
 */
export class VErrors {
    constructor(root, target) {
        this.root = root;
        this.target = target;
    }

    clearErrors() {
        const elements = this.root.querySelectorAll('.v-error-message');

        for (const element of elements) {
            element.remove();
        }
    }

    displayErrors(result) {
        const errors = this.normalize(result);

        for (const error of errors) {
            let fieldElement;
            let helperTextElement;
            const errorContainer = this.findErrorContainer(error.group);

            if (error.element) {
                fieldElement = this.find(error.element, {includeHidden: true});
            }

            if (fieldElement) {
                const id = fieldElement.id;
                helperTextElement = this.root.querySelector(`#${id}-input-helper-text, #${id}-helper-text`);
            }

            if (helperTextElement) {
                helperTextElement.textContent = error.message;
                helperTextElement.classList.add('mdc-text-field-helper-text--validation-msg');
                helperTextElement.classList.remove('v-hidden');

                // fieldElement can either be a MDC wrapper element or an
                // <input> element, so there's some indirection to resolve via
                // `vComponent`:
                fieldElement.vComponent?.element?.classList?.add('mdc-text-field--invalid');
            }

            // if the helper text element isn't visible, show the error in
            // an error container, prepending the key:
            if (errorContainer && !(helperTextElement?.isConnected && helperTextElement?.offsetParent)) {
                const element = document.createElement('div');
                element.classList.add('v-error-message');
                element.innerHTML = error.message;
                errorContainer.insertAdjacentElement('afterbegin', element);
            }
        }

        // Bring user to first error:
        const target = this.root.querySelector('.v-error-message,.mdc-text-field--invalid')

        if (target && !isElementVisible(target)) {
            target.scrollIntoView(true);
        }
    }

    /** @private */
    normalize(result) {
        // case A
        if (result instanceof Error) {
            return [new ActionError(result.message)];
        }

        const {statusCode, contentType, content} = result;
        let errors = [new ActionError("An unexpected error occurred.")];

        if (contentType?.includes('application/json')) {
            let response = JSON.parse(content);
            response = response?.errors ?? response;

            if (Array.isArray(response)) {
                // case B
                errors = response.map(err => new ActionError(err));
            }
            else {
                // case C
                errors = objectToFormData(response)
                    .map(([k, v]) => new ActionError(join(v), k));
            }
        }
        else if (contentType?.includes('v/errors')) {
            if (Array.isArray(content)) {
                // case D
                errors = content
                    .flatMap(a => Object.entries(a))
                    .map(([k, v]) => new ActionError(join(v), k));
            }
            else if ('exception' in content) {
                // case E
                errors = [new ActionError(String(content.exception))];
            }
            else {
                console.error("Unsupported error structure:", result);
                throw new Error('Unsupported error structure');
            }
        }
        else if (statusCode == 0) {
            // case F
            errors = [ActionError.networkError];
        }
        else if (statusCode) {
            // case G
            console.error("Server error:", result);
            errors = [
                new ActionError(`An unexpected error occurred. (HTTP ${statusCode})`)
            ];
        }

        return errors.map(e => e.toObject());
    }

    /** @private */
    findErrorContainer(errorGroup = null) {
        let container = this.target?.closest('.v-errors');

        if (errorGroup) {
            container = this.root.querySelector(`.v-errors[data-error-group="${errorGroup}"]`);
        }

        if (container?.isConnected && container?.offsetParent) {
            return container;
        }

        // a top-level .v-errors element is guaranteed to exist via the COPRL
        // layout, which calls #with_presenters_wrapper to render the
        // body/_wrapper partial. the body wrapper contains this .v-errors
        // element. this is true for both Sinatra-rendered COPRL and COPRL
        // rendered via Rails.
        return this.root.querySelector('.v-errors');
    }

    /** @private */
    find(nameOrID, options = {includeHidden: false}) {
        const element = this.root.querySelector(`#${nameOrID},[name="${nameOrID}"]`);

        if (element?.isConnected && element?.offsetParent || options.includeHidden) {
            return element;
        }

        return null;
    }
}

/**
 * Internal data class for normalized action errors.
 */
class ActionError {
    constructor(message, element = null) {
        if (typeof message != "string" || message.length == 0) {
            throw new TypeError("message must be a nonempty string");
        }

        this._message = message;
        this._element = element;
    }

    get message() {
        return this._message;
    }

    get element() {
        return this._element;
    }

    get group() {
        if (this.element?.match(/\[\w+\]/)) {
            return this.element.split(/[\[\]]/).filter(Boolean)[0];
        }

        return null;
    }

    toObject() {
        return {
            message: this.message,
            element: this.element,
            group: this.group
        };
    }

    static networkError = new ActionError("Network error: verify connection and try again.");
}

function join(value) {
    if (Array.isArray(value)) {
        return value.join(", ");
    }

    return value;
}

/**
 * Flattens an object to a structure suitable for use as form data. Nested keys
 * are flattened as "k1[k2][k3]...". The flattened object is return as an array
 * of key-value pairs.
 * @return Array
 */
function objectToFormData(object, parentKey = null) {
    let destination = [];

    for (const [k, v] of Object.entries(object)) {
        if (v == null || v == undefined) {
            continue;
        }

        const key = parentKey ? `${parentKey}[${k}]` : k;

        if (v?.constructor === Object) {
            destination = destination.concat(objectToFormData(v, key));
        }
        else {
            destination.push([key, v]);
        }
    }

    return destination;
}

function isElementVisible(element) {
    const rect = element.getBoundingClientRect()

    return rect.top >= 0
        && rect.left >= 0
        && rect.bottom <= window.innerHeight
        && rect.right <= window.innerWidth;

}
