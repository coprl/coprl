export class VToggleDisabled {
  constructor(options, params, event, root) {
    this.cssSelector = options.target;
    this.params = params;
    this.event = event;
    this.root = root;
  }

  call(results) {
    const cssSelector = this.cssSelector;
    const action = this.params.action;
    const delayAmt = this.event instanceof FocusEvent ? 500 : 0;
    const selectedElements = this.root.querySelectorAll(cssSelector);

    const promises = Array.from(selectedElements).map(function(elem) {
      return new Promise(function(resolve) {
        clearTimeout(elem.vTimeout);
        elem.vTimeout = setTimeout(function() {
          console.debug('Toggling disabled on: ' + elem.id);
          elem.disabled = (action === 'disable');
          results.push({action: 'toggle_disabled', statusCode: 200});
          resolve(results);
        }, delayAmt);
      });
    });

    return Promise.all(promises);
  }
}
