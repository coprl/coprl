import Clipboard from 'quill/modules/clipboard';
import { checkMimeType, unsupportedFileTypeError } from './mime-type';

/**
 * A Clipboard module for Quill which validates the MIME type of pasted files.
 */
export class ValidatingClipboard extends Clipboard {
    onPaste(event) {
        const file = (event.clipboardData.files || [])[0];

        // Since Quill constructs this module, no state can be passed in. Grab the owning rich text
        // area component from the DOM:
        const component = this.quill.container.closest('.v-rich-text-area-container').vComponent;
        const mimeTypes = component.acceptedMimeTypes;

        if (file) {
            component.errors.clearErrors();
        }

        if (file && !checkMimeType(file.type, mimeTypes)) {
            const error = unsupportedFileTypeError();

            component.errors.displayErrors(error);
            console.log(error);

            event.preventDefault();
            return false;
        }

        super.onPaste(event);
        return true;
    }
}
