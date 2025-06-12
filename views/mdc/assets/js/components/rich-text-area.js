import Quill from 'quill'
import ImageCompress from 'quill-image-compress'
import { HorizontalRuleBlot } from './rich-text-area/horizontal-rule-blot'
import { hookupComponents, VBaseComponent } from './base-component'
import { eventHandlerMixin } from './mixins/event-handler'
import { dirtyableMixin } from './mixins/dirtyable'
import Delta from 'quill-delta'
import Emitter from 'quill/core/emitter'
import { VErrors } from './events/errors'
import { checkMimeType, unsupportedFileTypeError } from './rich-text-area/mime-type'

// These Blots will be registered with Quill.
const blots = [
    HorizontalRuleBlot
];
const EMPTY_VALUE = '';

export function initRichTextArea(e) {
    console.debug('\tRich Text Area');
    hookupComponents(e, '.v-rich-text-area-container', VRichTextArea, null);
}

export class VRichTextArea extends dirtyableMixin(eventHandlerMixin(VBaseComponent)) {
    constructor(element, mdcComponent) {
        super(element, mdcComponent);

        this.quillWrapper = element.querySelector('.v-rich-text-area');
        this.acceptedMimeTypes = JSON.parse(this.quillWrapper.dataset.acceptedMimeTypes);
        this.errors = new VErrors(this.root, this.quillWrapper);

        if (!this.hasServerUpload()) {
            Quill.register('modules/imageCompress', ImageCompress);
        }

        configureQuill();
        registerBlots();

        this.quill = this.createQuillComponent();
        this.fixedUpContentElement = element.querySelector('.v-rich-text-area--fixed-up-content')
        this.quillEditor = this.quillWrapper.querySelector('.ql-editor');

        if (element.hasAttribute('disabled')) {
            this.quill.enable(false);
        }

        hookupCustomToolbarButtons(this);

        // Fix-ups:
        this.updateFixedContentElement();
        this.quill.on('text-change', () => this.updateFixedContentElement());

        adjustEditorStyles(this);
        this.originalValue = this.value();

        if (this.hasServerUpload()) {
            this.quill.on('text-change',  async () => await this.performServerImageUpload());
            this.quill.getModule('toolbar')
                .addHandler('image', this.toolbarImageButtonHandler.bind(this));
        }

        this.installDragAndDropValidation();
    }

    createQuillComponent() {
        let config = {
            modules: {
                toolbar: this.toolbarOptions(this.quillWrapper.dataset.toolbar)
            },
            bounds: this.quillWrapper,
            theme: 'snow',
            placeholder: this.quillWrapper.dataset.placeholder
        }

        if (!this.hasServerUpload()){
            config.modules.imageCompress = {
                quality: Number(this.quillWrapper.dataset.imgCompression),
                maxWidth: Number(this.quillWrapper.dataset.imgMaxWidth),
                maxHeight: Number(this.quillWrapper.dataset.imgMaxHeight),
                keepImageTypes:  ['image/jpeg', 'image/png'], // preserve these files type
                imageType: 'image/jpeg', // convert others to jpeg
                debug: true,
                suppressErrorLogging: false
            }
        }

        return new Quill(this.quillWrapper, config);
    }
    
    prepareSubmit(params) {
        params.push(['rich_text_payload', 'true']);
        params.push([this.name(), this.value()]);
    }

    name() {
        return this.quillWrapper.dataset.name;
    }

    hasServerUpload() {
        return !!(this.quillWrapper.dataset.serverUploadPath && this.quillWrapper.dataset.serverUploadEnabled);
    }

    value() {
        const document = this.fixedUpContentElement.innerHTML;

        return this.quill.editor.isBlank() ? EMPTY_VALUE : document;
    }

    clear() {
        if (this.value() !== EMPTY_VALUE) {
            this.setValue(EMPTY_VALUE);
        }
    }

    reset() {
        this.setValue(this.originalValue);
    }

    setValue(value) {
        this.quill.root.innerHTML = value;
    }

    isDirty() {
        return this.dirtyable
            && this.value().localeCompare(this.originalValue) !== 0;
    }

    updateFixedContentElement() {
        const rawDocument = this.quill.root.innerHTML;

        this.fixedUpContentElement.innerHTML = convertLists(rawDocument);
    }

    toolbarOptions(options) {
        const extTools = JSON.parse(options);
        const keys = Object.keys(extTools);
        const filteredOpts = keys.filter(function(key) {
            return extTools[key]
        });
        return [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }],
            [{ 'align': [] }],
            ['blockquote', 'horizontal-rule'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'direction': 'rtl' }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'size': ['xx-small', false, 'large', 'x-large'] }],
            filteredOpts,
            ['clean']
        ];
    }

    async performServerImageUpload() {
        const imgs = Array.from(
          this.quill.container.querySelectorAll('img[src^="data:"]:not(.uploading)')
        );

        for (const img of imgs) {
            img.classList.add("uploading");
            const result = await this.uploadBase64Img(img.getAttribute("src"));
            img.setAttribute("src", result.url);
            img.dataset.evvntBlobId = result.id;
            img.dataset.evvntUploadKey = result.upload_key;
            img.classList.remove("uploading");
        }
    }

    // Implement server upload instead of base64, see: https://github.com/quilljs/quill/issues/1089#issuecomment-614313509
    async uploadBase64Img(base64Str) {
        if (typeof base64Str !== 'string' || base64Str.length < 100) {
            return base64Str;
        }

        return await postToServer(base64Str, this.quillWrapper.dataset.serverUploadPath, this.quillWrapper.dataset.serverUploadKey);
    }

    toolbarImageButtonHandler() {
        // This handler was lifted from Quill's source and modified to check the file's MIME type.
        let fileInput = this.quill.container.querySelector('input.ql-image[type=file]');

        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.setAttribute('type', 'file');
            fileInput.setAttribute('accept', this.acceptedMimeTypes.join(','));
            fileInput.classList.add('ql-image');

            fileInput.addEventListener('change', () => {
                this.errors.clearErrors();
                const file = (fileInput.files || [])[0]

                if (!file) {
                    return
                }

                if (!checkMimeType(file.type, this.acceptedMimeTypes)) {
                    const error = unsupportedFileTypeError();

                    this.errors.displayErrors(error);
                    console.log(error);

                    return;
                }

                const reader = new FileReader();

                reader.onload = e => {
                    const range = this.quill.getSelection(true);
                    const delta = new Delta()
                        .retain(range.index)["delete"](range.length)
                        .insert({ image: e.target.result })

                    this.quill.updateContents(delta, Emitter.sources.USER);
                    this.quill.setSelection(range.index + 1, Emitter.sources.SILENT);

                    fileInput.value = "";
                };

                reader.readAsDataURL(fileInput.files[0]);
            });

            this.quill.container.appendChild(fileInput);
        }

        fileInput.click();
    }

    installDragAndDropValidation() {
        this.quill.container.addEventListener('drop', (event) => {
            this.errors.clearErrors();

            const file = (event.dataTransfer.files || [])[0];

            if (file && !checkMimeType(file.type, this.acceptedMimeTypes)) {
                event.preventDefault();

                const error = unsupportedFileTypeError(file);

                this.errors.displayErrors(error);
                console.log(error);

                return false;
            }
        });
    }
}

function adjustEditorStyles(richTextArea) {
    // The editor element is not created until Quill has been initialized, so
    // its styles must be adjusted dynamically post-construction.
    const initialHeight = richTextArea.element.dataset.initialHeight;

    richTextArea.quillEditor.style.height = initialHeight;
    richTextArea.quillEditor.style.minHeight = initialHeight;
}

const blotRegistry = new WeakSet();

function registerBlots() {
    for (const blot of blots) {
        if (blotRegistry.has(blot)) {
            continue;
        }

        // Set required Blot attributes:
        blot.blotName = blot.name;
        blot.tagName = blot.tag;

        Quill.register(blot);
        blotRegistry.add(blot)
    }
}

function hookupCustomToolbarButtons(vRichTextArea) {
    for (const blotClass of blots) {
        const {name, action} = blotClass;
        const buttons = vRichTextArea.element.querySelectorAll(`.ql-${name}`);

        for (const button of buttons) {
            // Invoke the Blot's action when button is clicked:
            button.addEventListener('click', (event) => {
                action(vRichTextArea.quill, event);
            });
        }
    }
}

function configureQuill() {
    // Inform Quill that it should decorate text objects with inline styles
    // instead of Quill CSS classes when modifying text:
    const sizeAttributor = Quill.import('attributors/style/size');
    sizeAttributor.whitelist = [
        'xx-small',
        'x-small',
        'small',
        'medium',
        'large',
        'x-large',
        'xx-large',
        false
    ];

    const styleAttributors = [
        sizeAttributor,
        Quill.import('attributors/style/align'),
        Quill.import('attributors/style/direction'),
    ];

    for (const attributor of styleAttributors) {
        Quill.register(attributor, true);
    }
}

// Quill 1 is not capable of generating structurally-sound nested lists. Instead
// of generated nested list elements, all list items are generated at the same
// level. Indentation and list item numbers are handled by various `indent` CSS
// classes and CSS counters. Eugh.
// see https://github.com/quilljs/quill/issues/979

// from https://github.com/quilljs/quill/issues/979#issuecomment-381151479.
function convertLists(richtext) {
    const tempEl = window.document.createElement('div');
    tempEl.setAttribute('style', 'display: none;');
    tempEl.innerHTML = richtext;

    ['ul','ol'].forEach((type) => {
        const startTag = `::start${type}::::/start${type}::`;
        const endTag = `::end${type}::::/end${type}::`;

        // Grab each list, and work on it in turn
        Array.from(tempEl.querySelectorAll(type)).forEach((outerListEl) => {
            const listChildren = Array.from(outerListEl.children).filter((el) => el.tagName === 'LI');

            // Account for the fact that the first li might not be at level 0
            const firstLi = listChildren[0];
            firstLi.before(startTag.repeat(getListLevel(firstLi)));

            // Now work through each li in this list
            listChildren.forEach((listEl, index) => {
                const currentLiLevel = getListLevel(listEl);
                if (index < listChildren.length - 1) {
                    const difference = getListLevel(listChildren[index + 1]) - currentLiLevel;

                    // we only need to add tags if the level is changing
                    if (difference > 0) {
                        listChildren[index + 1].before(startTag.repeat(difference));
                    } else if (difference < 0) {
                        listEl.after(endTag.repeat(-difference));
                    }
                } else {
                    listEl.after(endTag);
                }
            });
            outerListEl.after(endTag);
        });
    });

    //  Get the content in the element and replace the temporary tags with new ones
    let newContent = tempEl.innerHTML;
    newContent = newContent.replace(/::startul::::\/startul::/g, '<ul>');
    newContent = newContent.replace(/::endul::::\/endul::/g, '</ul>');
    newContent = newContent.replace(/::startol::::\/startol::/g, '<ol>');
    newContent = newContent.replace(/::endol::::\/endol::/g, '</ol>');

    tempEl.remove();
    return newContent;
}

function getListLevel(el) {
    const className = el.className || '0';
    return +className.replace(/[^\d]/g, '');
}

// See https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
}

// Based on https://ourcodeworld.com/articles/read/322/how-to-convert-a-base64-image-into-a-image-file-and-upload-it-with-an-asynchronous-form-using-jquery
function postToServer(base64, serverUploadPath, serverUploadKey) {
    return new Promise(resolve => {
        // Split the base64 string in data and contentType
        const block = base64.split(";");
        // Get the content type of the image
        const contentType = block[0].split(":")[1];

        // Get the real base64 content of the file
        const realData = block[1].split(",")[1];
        // Convert it to a blob to upload
        const blob = b64toBlob(realData, contentType);

        const fd = new FormData();

        fd.append('file', blob);
        fd.append('upload_key', serverUploadKey)
        const xhr = new XMLHttpRequest();
        xhr.open('POST', serverUploadPath, true);
        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText).data;
                resolve(data);
            }
        };
        xhr.send(fd);
    });
}
