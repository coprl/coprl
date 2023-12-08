export class VDialog {
    constructor(options, params, event, root) {
        this.dialogId = options.target;
        this.params = Object.assign({dismissable: true}, params);
        this.event = event;
        this.root = root;
    }

    get isDismissable() {
        return !!this.params.dismissable;
    }

    call(results) {
        const element = this.root.querySelector(`#${this.dialogId}`);

        if (!element) {
            const message = `Unable to find dialog #${this.dialogId}. Did you forget to attach it?`;

            results.push({
                action: 'dialog',
                contentType: 'v/errors',
                content: {exception: message},
            });

            return Promise.reject(results);
        }

        const dialog = element.vComponent;
        const mdcDialog = dialog.mdcComponent;

        if (this.isDismissable) {
            mdcDialog.escapeKeyAction = 'close';
            mdcDialog.scrimClickAction = 'close';
        } else {
            mdcDialog.escapeKeyAction = '';
            mdcDialog.scrimClickAction = '';
        }

        return new Promise((resolve, _) => {
            mdcDialog.listen('MDCDialog:closed', (event) => {
                results.push({
                    action: 'dialog',
                    statusCode: 200,
                    dialogAction: event.detail.action,
                });

                resolve(results);
            });

            dialog.open();
        });
    }
}
