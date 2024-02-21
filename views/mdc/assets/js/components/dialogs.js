import {VBaseContainer} from './base-container';
import {eventHandlerMixin} from './mixins/event-handler';
import {hookupComponents} from './base-component';
import {MDCDialog, MDCDialogFoundation} from '@material/dialog';

// Here be dragons.

/**
 * Causes the bound dialog's adapter to emit a closing event when applicable.
 * @param {String} action
 * @this {VDialog}
 */
function beforeClose(action = '') {
    const mdcDialog = this.mdcComponent;

    if (this.shouldNotifyClosing) {
        mdcDialog.foundation_.adapter_.notifyClosing(action);
        this.shouldNotifyClosing = false;
    }
}

/**
 * Actually closes the bound dialog.
 * @param {String} action
 * @this {MDCDialogFoundation}
 */
function hideDialog(action = '') {
    this.isOpen_ = false;
    this.adapter_.addClass(MDCDialogFoundation.cssClasses.CLOSING);
    this.adapter_.removeClass(MDCDialogFoundation.cssClasses.OPEN);
    this.adapter_.removeBodyClass(MDCDialogFoundation.cssClasses.SCROLL_LOCK);

    cancelAnimationFrame(this.animationFrame_);
    this.animationFrame_ = 0;

    clearTimeout(this.animationTimer_);
    this.animationTimer_ = setTimeout(() => {
        this.adapter_.releaseFocus();
        this.handleAnimationTimerEnd_();
        this.adapter_.notifyClosed(action);
    }, MDCDialogFoundation.numbers.DIALOG_ANIMATION_CLOSE_TIME_MS);
}

class ScopedMDCDialog extends MDCDialog {
    // The MDC spec does not explicitly define semantics for or forbid nested
    // dialogs. However, the MDC web implementation of dialogs pulls in *all*
    // buttons for "parent" dialogs, including those belonging to child
    // dialogs. This causes issues with MDCDialog's check to determine if
    // dialog action buttons need to be vertically stacked. (see
    // https://github.com/material-components/material-components-web/blob/v3.2.0/packages/mdc-dialog/README.md#action-button-arrangement)
    // So, work around this by ensuring only buttons owned by this dialog are
    // included:
    initialize(focusTrapFactory) {
        super.initialize(focusTrapFactory);
        const selector = `${MDCDialogFoundation.strings.BUTTON_SELECTOR}[data-owned-by="${this.root_.id}"]`;
        this.buttons_ = Array.from(this.root_.querySelectorAll(selector));
    }

    initialSyncWithDOM() {
        super.initialSyncWithDOM();
        this.foundationClose = this.foundation_.close.bind(this.foundation_);
        this.foundation_.close = this.checkedClose.bind(this);
    }

    checkedClose(action) {
        if (!action?.length) {
            this.foundationClose(action);

            return;
        }

        // only close if we're handling close for one of our own buttons,
        // not for a child/nested dialog:
        const button = this.buttons_.find((e) => e.dataset.mdcDialogAction == action);

        if (button?.dataset.ownedBy == this.root_.id) {
            this.foundationClose(action);
        }
    }
}

export function initDialogs(e) {
    console.debug('\tDialogs');
    hookupComponents(e, '.v-dialog', VDialog, ScopedMDCDialog);
}

export class VDialog extends eventHandlerMixin(VBaseContainer) {
    constructor(element, mdcComponent) {
        super(element, mdcComponent);

        // Closeable state:
        this.shouldNotifyClosing = true;
        this.canClose = false;

        mdcComponent.listen('MDCDialog:opened', this.onShow.bind(this));

        mdcComponent.listen('MDCDialog:closed', () => {
            this.reset();
            this.clearErrors();

            // Reset closeable state:
            this.shouldNotifyClosing = true;
            this.canClose = false;
        });

        mdcComponent.listen('MDCDialog:closing', (mdcEvent) => {
            const action = mdcEvent.detail.action;

            if (!action?.length) {
                const button = this.element.querySelector(`#${action}`);

                if (button?.dataset.ownedBy == this.element.id) {
                    const event = new CustomEvent('close', {
                        cancelable: true,
                        bubbles: false,
                        detail: {action},
                    });

                    this.element.dispatchEvent(event);
                }
            }
            else {
                const event = new CustomEvent('close', {
                    cancelable: true,
                    bubbles: false,
                    detail: {action},
                });

                this.element.dispatchEvent(event);
            }
        });
    }

    open() {
        this.mdcComponent.open();
    }

    closeDialog() {
        this.mdcComponent.close();
    }

    close(action = '') {
        action = action || '';

        beforeClose.call(this, action);

        if (this.canClose) {
            hideDialog.call(this.mdcComponent.foundation_, action);
        }
    }

    actionsSucceeded(vEvent) {
        // A successful run-to-completion of an event chain should always
        // attempt to close the dialog.
        this.shouldNotifyClosing = false;

        // We should only be closing the dialog for components marked as autoClose
        const dialogAction = vEvent.vComponent.element.dataset.autoClose;
        if (dialogAction !== undefined) {
            this.canClose = true;
            this.close(vEvent.event.detail.action);
        }
        super.actionsSucceeded(vEvent); // Bubble up
    }

    actionsHalted(vEvent) {
        // A halted event chain should not close the dialog.
        this.shouldNotifyClosing = true;
        this.canClose = false;
        super.actionsHalted(vEvent); // Bubble up
    }

    get buttons() {
        return this.components().filter((c) => c.is('VButton') && c.element.dataset.ownedBy == this.element.id);
    }

    afterInit() {
        const dialogHasHandlers = this.hasHandlers();
        const buttonsHaveHandlers = this.buttons.some((c) => c.hasHandlers());

        if (dialogHasHandlers || buttonsHaveHandlers) {
            // Stub in our own dialog close method to ensure events run to
            // completion before the dialog is closed:
            this.mdcComponent.foundation_.close = this.close.bind(this);
        }
    }
}
