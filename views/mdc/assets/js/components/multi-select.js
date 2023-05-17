import {MDCNotchedOutline} from '@material/notched-outline';
import {hookupComponentsManually} from './base-component';
import {VBaseComponent} from "./base-component";

export function initMultiSelects(root) {
  console.debug('\tMultiSelects');
  hookupComponentsManually(root, '.v-multi-select-container', function(element) {
    return new VMultiSelect(root, element);
  });
}

export class VMultiSelect extends VBaseComponent {
  constructor(root, element) {
    super(element, null);
    this.setEventListeners();
    this.setLabelHandlers();
    this.setChangeHandler();
  }

  prepareSubmit(params) {
    const selectedElementsValues = Array.from(this.element.querySelectorAll('.v-multi-select--option'))
      .filter((e) => e.checked)
      .map((e) => e.value);
    params.push([this.element.dataset.name, selectedElementsValues]);
  }

  setEventListeners() {
    this.element.addEventListener('click', createToggleHandler(this.element));
    document.addEventListener('click', createCloseHandler(this.element));
  }

  setLabelHandlers() {
    createValueDescriptionHandler(this.element);
    setCurrentValueDescription(this.element);
    setLabelNotch(this.element);
  }

  setChangeHandler() {
    const listElements = this.element.querySelectorAll('.v-multi-select--option');
    for (let element of listElements) {
      element.addEventListener('change', function(e) {
        this.element.querySelector('.v-multi-select').dispatchEvent(new Event('change', { composed: true, bubbles: true }));
      }.bind(this));
    }
  }
}

function createToggleHandler(component) {
  return function (event) {
    if (!event.target.classList.contains('v-multi-select--option')) {
      component.querySelector('.v-multi-select--options-list').classList.toggle('v-hidden');
      component.classList.toggle('mdc-select--focused');
    }
  }
}

function createCloseHandler(component) {
  return function (event) {
    if (!event.target.className.match(/[\w-]*v-multi-select[\w-]*/g)) {
      component.querySelector('.v-multi-select--options-list').classList.add('v-hidden');
      component.classList.remove('mdc-select--focused');
    }
  }
}

function createValueDescriptionHandler(component) {
  const listElements = component.querySelectorAll('.v-multi-select--option');
  for (let element of listElements) {
    element.addEventListener('change', function(e){
      setCurrentValueDescription(component);
    })
  }
}

function setCurrentValueDescription(component) {
  const selectedElements = Array.from(component.querySelectorAll('.v-multi-select--option')).filter((e) => e.checked );
  let msg = selectedElements.length + ' selected';
  if (selectedElements.length === 1 && selectedElements[0].labels.length === 1) {
    msg = selectedElements[0].labels[0].innerText;
  }
  component.querySelector('.v-multi-select--current-values').innerText = msg;
}

function setLabelNotch(component) {
  const labelWidth = component.querySelector('.mdc-floating-label').offsetWidth * .75;
  const notchedOutline = new MDCNotchedOutline(component.querySelector('.mdc-notched-outline'));
  notchedOutline.notch(labelWidth);
}



