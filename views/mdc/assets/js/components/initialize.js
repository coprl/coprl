import {initButtons} from './button';
import {initDialogs} from './dialogs';
import {initDateTime} from './datetime';
import {initTextFields} from './text-fields';
import {initEvents} from './events';
import {initLists} from './lists';
import {initDrawer} from './drawer';
import {initHeader} from './header';
import {initIconToggles} from './icon-toggles';
import {initMenus} from './menus';
import {initSelects} from './selects';
import {initChips} from './chips';
import {initCards} from './cards';
import {initForms} from './forms';
import {initSnackbar} from './snackbar';
import {initCheckboxes} from './checkboxes';
import {initSwitches} from './switches';
import {initRichTextArea} from './rich-text-area';
import {initSteppers} from './steppers';
import {initRadios} from './radios';
import {initSliders} from './sliders';
import {initHiddenFields} from './hidden-fields';
import {initContent} from './content';
import {initGrid} from './grid';
import {initTabBars} from './tab-bars';
import {initTables} from './data-tables';
import {initFileInputs} from './file-inputs';
import {initFormFields} from './form-fields';
import {initImages} from './images';
import {initTypography} from './typography';
import {initTooltips} from './tooltip';
import {initPlugins} from './plugins';
import {initProgress} from './progress';

export function initialize(root, setRoot) {
    console.debug('Initializing components');

    const start = performance.now();

    initButtons(root);
    initDialogs(root);
    initDateTime(root);// MUST BE BEFORE initTextFields
    initTextFields(root);
    initLists(root);
    initDrawer(root);
    initHeader(root);
    initIconToggles(root);
    initMenus(root);
    initSelects(root);
    initChips(root);
    initCards(root);
    initForms(root);
    initSnackbar(root);
    initCheckboxes(root);
    initSwitches(root);
    initRichTextArea(root);
    initSteppers(root);
    initRadios(root);
    initSliders(root);
    initHiddenFields(root);
    initContent(root);
    initGrid(root);
    initTabBars(root);
    initTables(root);
    initFileInputs(root);
    initFormFields(root);
    initImages(root);
    initTypography(root);
    initProgress(root);
    initTooltips(root);
    initPlugins(root);

    // This needs to be last, because it relies on the components installed above.
    initEvents(root);

    const end = performance.now();
    console.debug('Done in %s ms', (end - start).toFixed(2));
}
