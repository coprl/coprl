import {MDCChip} from '@material/chips';
import {MDCChipSet} from '@material/chips';
import {eventHandlerMixin} from './mixins/event-handler';
import {VBaseComponent, hookupComponentsManually} from './base-component';

// https://github.com/material-components/material-components-web/tree/v3.2.0/packages/mdc-chips

export const EVENT_SELECT = 'select';
export const EVENT_DESELECT = 'deselect';

export const VARIANT_CHOICE = 'choice';
export const VARIANT_FILTER = 'filter';
export const VARIANT_INPUT = 'input';
export const VARIANT_STATIC = 'static';

// event.keyCode constants
const KEYS = {
    backspace: 8,
    delete: 46,
    leftArrow: 37,
    rightArrow: 39,
    comma: 188,
    enter: 13,
    space: 32,
    IMESequence: 229,
};

export function initChips(root) {
    console.debug('\tChips');

    // The chip set > chip hierarchy is established differently than other
    // components: a chip set constructs and manages MDCChip components for its
    // child elements. Because of this, a `hookupComponents` call for .v-chip is
    // not needed.
    hookupComponentsManually(root, '.v-chip-set', function(element) {
        const mdcChipSet = new MDCChipSet(element, undefined, (element) => {
            const mdcChip = new MDCChip(element);

            // value is unused, but the constructor has side effects.
            new VChip(element, mdcChip);

            // the MDC chip set expects to manage instances of MDCChip, not
            // VChip, so the chip factory must produce MDC chips.
            return mdcChip;
        });

        return new VChipSet(element, mdcChipSet);
    });
}

export class VChip extends eventHandlerMixin(VBaseComponent) {
    constructor(element, mdcComponent) {
        super(element, mdcComponent);

        this.mdcComponent.listen('MDCChip:selection', (event) => {
            this.element.dispatchEvent(new Event(event.detail.selected ? EVENT_SELECT : EVENT_DESELECT));
        });

        mdcComponent.shouldRemoveOnTrailingIconClick = this.variant == VARIANT_INPUT;

        if (this.variant == VARIANT_INPUT) {
            // Store the `name` attribute so we can use it when generating new chips:
            this.element.dataset.name = this.element.dataset.name || this.chipSet.dataset.name;

            this.mdcComponent.listen('keydown', (event) => {
                switch (event.keyCode) {
                case KEYS.backspace:
                case KEYS.delete:
                    this.chipSet.vComponent.focusTextField();
                    this.chipSet.vComponent.removeChip(this.element);
                    break;
                case KEYS.leftArrow:
                case KEYS.rightArrow:
                    event.preventDefault();
                    break;
                }
            });
        }
    }

    // Called to collect data for submission
    prepareSubmit(params) {
        if (this.shouldSubmitParams) {
            params.push([this.name(), this.value()]);
        }
    }

    name() {
        return this.element.getAttribute('data-name');
    }

    value() {
        return this.element.getAttribute('data-value');
    }

    clear() {
        console.debug('Chip clear is a no-op');
    }

    setValue(value) {
        this.element.setAttribute('data-value', value);
    }

    get shouldSubmitParams() {
        // Selectable chips (those within a :filter or :choice chipset) which
        // are not currently selected do not submit their value.
        return this.name() && this.value()
            && (!this.selectable || this.mdcComponent.selected);
    }

    get chipSet() {
        return this.element.closest('.v-chip-set');
    }

    get variant() {
        return this.chipSet.dataset.variant;
    }

    get selectable() {
        return this.variant == VARIANT_CHOICE || this.variant == VARIANT_FILTER;
    }
}

export class VChipSet extends eventHandlerMixin(VBaseComponent) {
    constructor(element, mdcComponent) {
        super(element, mdcComponent);

        this.mdcComponent.listen('MDCChip:removal', (event) => {
            this.removeChip(event.target);
        });

        // handle moving amongst sibling chips:
        this.mdcComponent.listen('keydown', (event) => {
            switch (event.keyCode) {
            case KEYS.leftArrow: {
                if (!event.target.matches('.v-chip')) {
                    return;
                }

                const previousSibling = event.target.previousElementSibling;

                if (previousSibling && previousSibling.matches('.v-chip')) {
                    previousSibling.focus();
                }
                break;
            }
            case KEYS.rightArrow: {
                const nextSibling = event.target.nextElementSibling;

                if (nextSibling && nextSibling.matches('.v-chip, .mdc-chip-set--input input')) {
                    nextSibling.focus();
                }
                break;
            }
            }
        });

        if (this.variant == VARIANT_INPUT) {
            this.textField = this.element.querySelector('.v-text-field');
            this.input = this.textField.querySelector('input');

            this.textField.addEventListener('focusout', (event) => {
                // remain visually focused if the new focused element is within the chip set:
                if (event.relatedTarget && event.relatedTarget.closest('.v-chip-set') == this.element) {
                    this.textField.classList.add('mdc-text-field--focused');
                }
                else {
                    this.textField.classList.remove('mdc-text-field--focused');
                }

                // keep the label floating if there are any chips in the chip set or text in the input field:
                if (this.chips.length > 0 || this.input.value.length > 0) {
                    this.textField.vComponent.mdcComponent.foundation_.notchOutline(true);
                    this.textField.vComponent.label.classList.add('mdc-floating-label--float-above');
                }
                else {
                    this.textField.vComponent.mdcComponent.foundation_.notchOutline(false);
                    this.textField.vComponent.label.classList.remove('mdc-floating-label--float-above');
                }
            });

            // TODO: internationalization: determine and use locale list separator character(s). see `Intl.ListFormat`?
            // TODO: all of this is likely better handled by the `input` event.
            this.textField.addEventListener('keydown', (event) => {
                if (event.isComposing || event.keyCode == KEYS.IMESequence) {
                    // user is composing a single character via multiple key
                    // strokes – ignore input until they're done.
                    return;
                }

                switch (event.keyCode) {
                case KEYS.enter:
                    event.preventDefault(); // prevent submitting form
                    // fallthrough
                case KEYS.comma:
                case KEYS.space: {
                    const text = this.textField.vComponent.value().trim();

                    if (!text || text.length < 1) {
                        return;
                    }

                    this.addChip(this.makeInputChip(text));
                    this.textField.vComponent.clear();
                    break;
                }
                case KEYS.backspace:
                case KEYS.leftArrow: {
                    if (document.activeElement != this.textField.querySelector('input')) {
                        return;
                    }

                    // select the last chip if we're at the start of the text:
                    const start = this.input.selectionStart;
                    const length = Math.abs(this.input.selectionEnd - this.input.selectionStart);

                    if (start == 0 && length < 1) {
                        if (this.lastChip) {
                            this.lastChip.focus();
                        }
                    }

                    break;
                }
                default:
                    break;
                }
            });

            if (this.chips.length > 0) {
                this.textField.vComponent.mdcComponent.foundation_.notchOutline(true);
                this.textField.vComponent.label.classList.add('mdc-floating-label--float-above');

                for (const chip of this.chips) {
                    this.input.insertAdjacentElement('beforebegin', chip);
                }
            }

            // when focusing a chip, the owning chip set should appear focused:
            this.element.addEventListener('focusin', (event) => {
                this.textField.vComponent.mdcComponent.foundation_.notchOutline(true);
                this.textField.classList.add('mdc-text-field--focused');
                this.textField.vComponent.label.classList.add('mdc-floating-label--float-above');
            });

            // when focus moves outside of the chip set, the owning chip set should appear to have lost focus:
            this.element.addEventListener('focusout', (event) => {
                if (!event.relatedTarget || event.relatedTarget.closest('.v-chip-set') != this.element) {
                    this.textField.classList.remove('mdc-text-field--focused');
                }
            });
        }
    }

    get chips() {
        return this.element.querySelectorAll('.v-chip');
    }

    get variant() {
        return this.element.dataset.variant;
    }

    get lastChip() {
        return this.textField.querySelector('.v-chip:last-of-type');
    }

    addChip(element) {
        // https://github.com/material-components/material-components-web/tree/v3.2.0/packages/mdc-chips#adding-chips-to-the-dom
        if (this.lastChip) {
            this.lastChip.insertAdjacentElement('afterend', element);
        }
        else {
            this.textField.insertAdjacentElement('afterbegin', element);
        }

        // `MDCChipSet.addChip` runs its chip factory (see above, `initChips`),
        // which creates an MDCChip and a VChip.
        this.mdcComponent.addChip(element);
    }

    removeChip(element) {
        // https://github.com/material-components/material-components-web/tree/v3.2.0/packages/mdc-chips#removing-chips-from-the-dom
        // most of a chip's removal is handled by MDC, but removing the DOM node
        // is left to us.
        element.remove();
        this.focusTextField();
    }

    focusTextField() {
        if (!this.textField) {
            return;
        }

        this.textField.vComponent.focus();
    }

    makeInputChip(text, value = text) {
        // don't put ${text} or ${value} in this template literal. without escaping, it's vulnerable to XSS.
        const html = `
            <button type="button" class="v-chip v-input mdc-chip v-component" tabindex="0">
                <div class="v-typography mdc-typography--chip-text mdc-chip__text v-component"></div>
                <i class="v-icon mdc-chip__icon mdc-chip__icon--trailing material-icons">cancel</i>
            </button>
        `;
        const template = document.createElement('template');
        template.innerHTML = html.trim();

        const element = template.content.firstChild;
        element.dataset.value = value;
        element.querySelector('.v-typography').textContent = text;

        return element;
    }
}
