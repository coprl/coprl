export class VToggleDisabled {
    constructor(options, params, event, root) {
        this.targetId = options.target;
        this.targetSelector = params.selector;
        this.params = params;
        this.event = event;
        this.root = root;
    }

    call(results) {
        const targetId = this.targetId;
        const targetSelector = this.targetSelector;
        const action = this.params.action;
        const delayAmt = this.event instanceof FocusEvent ? 500 : 0;

        if (targetId) {
            return this.toggleDisabledbyId(targetId, action, delayAmt, results);
        }
        else if (targetSelector) {
            return this.toggleDisabledBySelector(targetSelector, action, delayAmt, results);
        }
        else {
            throw new Error('No targetId or targetSelector specified!');
        }
    }

    toggleDisabledbyId(targetId, action, delayAmt, results) {
        const elem = this.root.getElementById(targetId);

        if (!elem) {
            return this.notFoundError(`Id: ${targetId}`, results);
        }

        return new Promise(function(resolve) {
            clearTimeout(elem.vTimeout);

            elem.vTimeout = setTimeout(function() {
                console.debug('Toggling disabled on: ' + targetId);
                elem.disabled = (action === 'disable');
                results.push({action: 'toggle_disabled', statusCode: 200});
                resolve(results);
            }, delayAmt);
        });
    }

    toggleDisabledBySelector(targetSelector, action, delayAmt, results) {
        const selectedElements = this.root.querySelectorAll(targetSelector);

        if (!selectedElements.length) {
            return this.notFoundError(targetSelector, results);
        }

        const promises = Array.from(selectedElements).map(function(elem) {
            return new Promise(function(resolve) {
                clearTimeout(elem.vTimeout);
                elem.vTimeout = setTimeout(function() {
                    elem.disabled = (action === 'disable');
                    results.push({action: 'toggle_disabled', statusCode: 200});
                    resolve(results);
                }, delayAmt);
            });
        });

        return Promise.all(promises);
    }

    notFoundError(selector, results) {
        const err = new Error(
            `Unable to locate element(s) with ${selector}!`
        );

        results.push({
            action: 'toggle_disabled',
            contentType: 'v/errors',
            content: {exception: err.message},
        });

        return new Promise((_, reject) => reject(results));
    }
}
