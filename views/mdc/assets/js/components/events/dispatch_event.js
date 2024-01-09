import {VBase} from './base';

export class VDispatchEvent extends VBase {
    constructor(options, params, event, root) {
        super(options, root);

        this.eventName = params.name;
        this.source = event.target;
        this.target = this.source;

        if (params.from) {
            this.target = root.querySelector(`#${params.from}`);
        }
    }

    async call(results) {
        if (!this.target) {
            throw new Error('Unable to find target element!');
        }

        const event = new CustomEvent(this.eventName, {detail: {source: this.source}, bubbles: true});
        this.target.dispatchEvent(event);

        results.push({action: 'dispatch_event', statusCode: 200});

        return results;
    }
}
