import flatpickr from 'flatpickr';
import { MDCTextField } from '@material/textfield';
import { VTextField } from './text-fields';
import { hookupComponents, unhookupComponents } from './base-component';
import appConfig from '../config';
import {DateParser} from '../utils/date-parser';

// field types:
const TYPE_DATE = 'date';
const TYPE_TIME = 'time';
const TYPE_DATE_TIME = 'datetime';

// date/time selection modes:
// (see https://flatpickr.js.org/options, option `mode`)
const MODE_SINGLE = 'single';
const MODE_MULTIPLE = 'multiple';
const MODE_RANGE = 'range';

export function initDateTime(e) {
    console.debug('\tDateTime');
    hookupComponents(e, '.v-datetime', VDateTime, MDCTextField);
    hookupComponents(e, '.v-date-text', VDateText, MDCTextField);
}

export function uninitDateTime(root) {
    console.debug('\tUninit DateTime');
    unhookupComponents(root, '.v-datetime');
    unhookupComponents(root, '.v-date-text');
}

export class VDateTime extends VTextField {
    constructor(element, mdcComponent) {
        super(element, mdcComponent);

        const defaultConfig = {altInput: true};

        if (!this.root.documentElement) {
          defaultConfig.appendTo = this.root.querySelector('.v-root');
        }

        const config = Object.assign(
            defaultConfig,
            appConfig.get('component.datetime.flatpickr', {}),
            JSON.parse(element.dataset.config),
        );

        if (this.type === TYPE_DATE_TIME) {
            config.enableTime = true;
        } else if (this.type === TYPE_TIME) {
            config.enableTime = true;
            config.noCalendar = true;
        }

        config.onOpen = function onOpen(selectedDates, dateStr, instance) {
            instance.mdc_text_field.foundation_.activateFocus();
        };
        config.onClose = function onClose(selectedDates, dateStr, instance) {
            instance.mdc_text_field.foundation_.deactivateFocus();
            const event = new Event('closed');
            element.dispatchEvent(event);
        };

        this.fp = flatpickr(this.input, config);
        this.fp.mdc_text_field = mdcComponent;

        // Avoid dispatching `input` event before both ends of a date range have
        // been selected:
        if (this.mode == MODE_RANGE) {
            this.input.addEventListener('input', e => {
                // not `< 2` because `selectedDates.length` will be 0 when the
                // selector is cleared via the ✕ button.
                if (this.fp.selectedDates.length == 1) {
                    e.stopPropagation();
                    return false;
                }
            })
        }

        element.addEventListener('click', () => this.toggle());
        this.originalValue = this.fp.input.value;
    }

    destroy() {
        super.destroy();
        this.fp.destroy();
        delete this.fp;
    }

    clear() {
        if (this.fp.input.value !== '') {
            this.fp.clear();
        }

        this.mdcComponent.foundation_.deactivateFocus();
    }

    reset() {
        // reset() can be called after a component has been destroyed, so guard against this case:
        if (!this.fp) {
            return;
        }

        this.fp.setDate(this.originalValue);
    }

    open() {
        this.fp.open();
    }

    close() {
        this.fp.close();
    }

    toggle() {
        this.fp.toggle();
    }

    isDirty() {
        if (!this.dirtyable) {
            return false;
        }
        const currVal = new Date(this.fp.input.value);
        const prevVal = new Date(this.originalValue);
        return currVal.getTime() !== prevVal.getTime();
    }

    get mode() {
        if (!this._mode) {
            const config = JSON.parse(this.element.dataset['config']) || {};

            this._mode = config['mode'] || MODE_SINGLE; // default per Flatpickr
        }

        return this._mode;
    }

    get type() {
        return this.element.dataset['type'];
    }
}

export class VDateText extends VTextField {
    constructor(element, mdcComponent) {
        super(element, mdcComponent);

        const locale = this.element.dataset.locale;
        this.setLocale(locale);

        element.vComponent.input.addEventListener('blur', () => this.validate());
        element.vComponent.input.addEventListener('input', () => this.format());
        window.addEventListener('languagechanged', () => this.setLocale(null));
    }

    validate(formData) {
        this.input.setCustomValidity(''); // Reset any previous validation errors
        const value = this.value();

        if (!this.input.required && (!value || value.length < 1)) {
            return true;
        }

        const date = this.dateParser.parse(value);

        if (date != null) {
            if (this.origHelperText !== '') {
                this.helperDisplay.innerHTML = this.origHelperText;
                this.helperDisplay.classList.remove('mdc-text-field-helper-text--validation-msg');
                this.element.classList.remove('mdc-text-field--invalid');
            }
            else {
                this.helperDisplay.classList.add('v-hidden');
            }

            return true;
        }

        const message = this.helperDisplay.dataset.validationError ?
            this.helperDisplay.dataset.validationError :
            this.input.validationMessage;

        this.helperDisplay.innerHTML = message;
        this.helperDisplay.classList.add('mdc-text-field-helper-text--validation-msg');
        this.element.classList.add('mdc-text-field--invalid');
        this.mdcComponent.label_.shake(true);
        this.input.setCustomValidity('Invalid date');

        return {[this.element.id]: message};
    }

    isDirty() {
        if (!this.dirtyable) {
            return false;
        }

        const value = new Date(this.fp.input.value);
        const original = new Date(this.originalValue);

        return value.getTime() != original.getTime();
    }

    prepareSubmit(params) {
        // validate will have halted submission if the input's value is not a valid date, so here
        // we're safe to assume the input is valid.
        params.push([this.input.name, this.dateParser.parse(this.value())]);
    }

    /**
     * Sets the locale for the component.
     * @param {String} tag A Unicode locale identifier string. If not provided, the value of
     * `navigator.language` is used.
     * @private
     */
    setLocale(tag = navigator.language) {
        this.locale = new Intl.Locale(tag);
        this.formatter = new Intl.DateTimeFormat(this.locale);
        this.dateParser = new DateParser(this.formatter);
        this.parts = this.formatter.formatToParts();

        this.origHelperText = this.hintText;
        this.helperDisplay.dataset.validationError = this.origHelperText;
        this.helperDisplay.textContent = this.origHelperText;

        console.debug('VDateText: locale =', this.locale);
    }

    /** @private */
    get hintText() {
        // Map each date format part to a human-readable representation of the part's expected
        // format:
        const format = this.parts.map(({type, value}) => {
            switch (type) {
            case 'day':
                return 'DD';
            case 'month':
                return 'MM';
            case 'year':
            case 'relatedYear':
            case 'yearName':
                return 'YYYY';
            default:
                return value.trim();
            }
        });

        return stripDirectionMarkers(format.join(''));
    }

    /**
     * Formats the component's value as the user types, inserting separators between digit groups
     * where appropriate.
     * @private
     */
    format() {
        const mask = this.hintText;
        const formattedValue = [];
        const separators = this.parts
            .filter(({type, value}) => type == 'literal')
            .map(({type, value}) => stripDirectionMarkers(value));
        const value = String(this.input.value).trim();
        let inputIndex = 0;

        // iterate over the mask (to ensure |input| ≤ |mask|), building a formatted date string:
        for (let i = 0; i < mask.length; i++) {
            const placeholder = mask[i];
            const input = value[inputIndex];

            if (input === undefined) {
                // no input left to consume.
                break;
            }

            if (isSeparator(input) && isLetter(placeholder)) {
                // if the user manually provided a separator, take input and skip to the next
                // digit group:
                formattedValue.push(input);
                inputIndex++;
                i++;
            }
            else if (isInteger(input) && isSeparator(placeholder)) {
                // prefix input with a separator if it's a digit and placeholder is a separator:
                const separator = separators.shift() || '/'; // just in case!

                formattedValue.push(separator);
                formattedValue.push(input);
                inputIndex++;
                i += separator.length; // skip over placeholder
            }
            else if (isInteger(input) && isLetter(placeholder) || isSeparator(input)) {
                // if input is a digit and placeholder is a letter, or if input is a separator,
                // pass it through:
                formattedValue.push(input);
                inputIndex++;
            }
        }

        this.input.value = formattedValue.join('');
    }
}

function isInteger(value) {
    return Boolean(value.trim().match(/\p{N}/u));
}

const PLACEHOLDERS = ['d', 'D', 'm', 'M', 'y', 'Y'];

function isLetter(value) {
    return PLACEHOLDERS.includes(value);
}

function isSeparator(value) {
    return Boolean(value.trim().match(/\p{P}/u));
}

function stripDirectionMarkers(value) {
    // Strip all LRM/RLM code points to normalize non-digit values:
    return value.trim().replaceAll(/(\u200e|\u200f)/g, '');
}
