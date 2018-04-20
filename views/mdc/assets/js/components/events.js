import {VLoadsPage} from './events/loads';
import {VPost} from './events/post';
import {VReplaceElement} from './events/replace';
import {VDialog} from './events/dialog';
import {VErrors} from './events/errors';
import {VToggleVisiblity} from './events/toggle_visiblity';
import {VSnackbarEvent} from './events/snackbar';
import {VAutoComplete} from './events/autocomplete';

export class VEvents {
    //[[type, url, target, params]]
    constructor(actions, event) {
        this.event = event;
        this.actions = actions.map((action) => {
            return this.constructor.action_class(action, event);
        });
    }

    call() {
        // Adapted from http://www.datchley.name/promise-patterns-anti-patterns/#executingpromisesinseries
        var fnlist = this.actions.map((action) => {
            return function () {
                return Promise.resolve(action.call());
            };
        });

        // Execute a list of Promise return functions in series
        function pseries(list) {
            var p = Promise.resolve();
            return list.reduce(function (pacc, fn) {
                return pacc = pacc.then(fn);
            }, p);
        }

        var event = this.event;

        pseries(fnlist)
            .then(function (results) {
                var contentType = results[1];
                // var responseText = results[2];
                var responseURL = results[3];

                if (event.target.dialog) {
                    event.target.dialog.close();
                }
                if (contentType && contentType.indexOf("text/html") !== -1 && typeof responseURL !== 'undefined') {
                    window.location = responseURL;
                }

            }).catch(function (results) {
            new VErrors(event).displayErrors(results);
        });
    }

    static action_class(action, event) {
        var action_type = action[0];
        var url = action[1];
        var options = action[2];
        var params = action[3];

        switch (action_type) {
            case 'loads':
                return new VLoadsPage(options, url);
            case 'replaces':
                return new VReplaceElement(options, url, params, event);
            case 'post':
                return new VPost(options, url, params, 'POST', event);
            case 'update':
                return new VPost(options, url, params, 'PUT', event);
            case 'delete':
                return new VPost(options, url, params, 'DELETE', event);
            case 'dialog':
                return new VDialog(options, params, event);
            case 'toggle_visibility':
                return new VToggleVisiblity(options, params, event);
            case 'snackbar':
                return new VSnackbarEvent(options, params, event);
            case 'autocomplete':
                return new VAutoComplete(options, url, params, event);
            default:
                throw action_type + ' is not supported.';
        }
    }

}

// This is used to get a proper binding of the actionData
// https://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example
function createEventHandler(actionsData) {
    return function (event) {
        new VEvents(actionsData, event).call();
    };
}

export function initEvents() {
    console.log('\tEvents');

    var events = document.querySelectorAll('[data-events]');
    for (var i = 0; i < events.length; i++) {
        var eventElem = events[i];
        var eventsData = JSON.parse(eventElem.dataset.events);
        for (var j = 0; j < eventsData.length; j++) {
            var eventData = eventsData[j];
            var eventName = eventData[0];
            var actionsData = eventData[1];
            if (typeof eventElem.eventsHandler == 'undefined' ||
                !eventElem.eventsHandler[eventName]) {
                var eventHandler = createEventHandler(actionsData);
                eventElem.eventsHandler = {};
                eventElem.eventsHandler[eventName] = eventHandler;
                eventElem.addEventListener(eventName, eventHandler);
            }
        }
    }
}


