import {MDCSelect} from '@material/select';
import {VBaseComponent, hookupComponents} from './base-component';
import {visibilityObserverMixin} from "./mixins/visibility-observer";
import {dirtyableMixin} from './mixins/dirtyable';

export function initSelects(e) {
    console.debug('\tSelects');
    hookupComponents(e, '.v-select', VSelect, MDCSelect);
}

export class VSelect extends dirtyableMixin(visibilityObserverMixin(VBaseComponent)) {
    constructor(element, mdcComponent) {
        super(element, mdcComponent);
        this.select = element.querySelector('select');
        this.label = element.querySelector('label');
        this.select.vComponent = this;
        this.recalcWhenVisible(this);
        this.originalValue = this.value();
        this.helperDisplay = this.root.getElementById(`${element.id}-input-helper-text`);
        this.origHelperText = this.helperDisplay.innerHTML.trim();
    }

    prepareSubmit(params) {
        params.push([this.name(), this.value()]);
    }

    // Called whenever a form is about to be submitted.
    // returns true on success
    // returns on failure return an error object that can be processed by VErrors:
    //    { email: ["email must be filled", "email must be from your domain"] }
    //    { :page: ["must be filled"] }
    validate(formData) {
        console.debug('Select validate', formData);
        const isValid = this.select.checkValidity();
        if (isValid) {
            this.resetHelperDisplay();

            return true;
        }

        const message = this.helperDisplay.dataset.validationError ?
          this.helperDisplay.dataset.validationError :
          this.select.validationMessage;

        const errorMessage = {};
        errorMessage[this.element.id] = [message];
        this.element.classList.add('mdc-select-field--invalid');
        return errorMessage;
    }

    name() {
        return this.select.name;
    }

    value() {
        return this.select.options.length === 0 || this.select.selectedIndex === -1 ? null : this.select.options[this.select.selectedIndex].value;
    }

    clear() {
        let before = this.select.selectedIndex;
        this.select.selectedIndex = 0;
        if (before !== 0) {
            var event = new InputEvent('input', {
                view: window,
                bubbles: true,
                cancelable: true
              });
            this.select .dispatchEvent(event);
        }
    }

    reset() {
        this.setValue(this.originalValue);
    }

    setValue(value) {
        this.select.value = value;

        if (value) {
            this.label.classList.add('mdc-floating-label--float-above');
        }
        else {
            this.label.classList.remove('mdc-floating-label--float-above');
        }
    }

    isDirty() {
        return this.dirtyable && this.value() !== this.originalValue;
    }

    resetHelperDisplay() {
        if (this.shouldShowHelperText) {
            this.helperDisplay.innerHTML = this.origHelperText;
            this.helperDisplay.classList.remove('v-hidden', 'mdc-text-field-helper-text--validation-msg');
        }
        else {
            this.helperDisplay.classList.add('v-hidden');
        }

        this.element.classList.remove('mdc-select-field--invalid');
    }

    get shouldShowHelperText() {
        return this.helperDisplay && Boolean(this.origHelperText);
    }
}
