import isCompatible from './utils/compatibility';
import config from './config';
import {initialize} from './components/initialize';
import {uninitialize} from './components/uninitialize';

window.coprl = window.corpl || {};
window.coprl.initialize = initialize;
window.coprl.uninitialize = uninitialize;
window.coprl.turboInitialLoad = true;
const initializationHandler = () => {
    if (!isCompatible) {
        const errorMessage = config.get(
            'compatibility.errorMessage',
            'Unsupported browser!',
        );

        document.body.innerHTML = `<p>${errorMessage}</p>`;

        return;
    }

    document.documentElement.classList.remove('incompatible-browser');

    require('material-design-lite/material');
    require('./mdl-stepper');
    require('./components/initialize').initialize(document, true);

    // Focus first valid input control
    const focusable = document.querySelectorAll('.v-focusable');
    for (const element of focusable) {
        const comp = element.vComponent;
        if (comp && comp.respondTo('focus') && comp.focus()) {
            break;
        }
    }
};

document.addEventListener('DOMContentLoaded', initializationHandler);
document.addEventListener('turbo:load', (event) => {
    if (window.coprl.turboInitialLoad) {
        console.debug('Skipping coprl initialization, it will be handled by DOMContentLoaded');
        window.coprl.turboInitialLoad = false;
        return;
    }
    initializationHandler(event);
});
