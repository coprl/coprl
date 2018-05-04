export class VDialog {
    constructor(options, params, event) {
        this.dialogId = options.target;
        this.params = params;
        this.event = event;
    }

    call(results) {
        var dialog = document.querySelector('#' + this.dialogId);
        if(dialog) {
            if (!dialog.showModal) {
                dialogPolyfill.registerDialog(dialog);
            }

            dialog.showModal();
        }else {
            console.error("Unable to find dialog with id: "+this.dialogId+". Usually this means you forgot to attach it to the currently rendered page.");
        }
        var promiseObj = new Promise(function (resolve) {
            results.push({action:'dialog', statusCode: 200});
            resolve(results);
        });
        return promiseObj;
    }
}