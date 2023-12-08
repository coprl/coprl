import {VBase} from './base';
import {VEvents} from '../events';

export class VParallelGroup extends VBase {
    constructor(options, params, event, root) {
        super(options, root);

        this.params = params;
        this.event = event;
        this.resolvedActions = params.actions.map(action => VEvents.action_class(action, event, root));
    }

    call(results) {
        const promises = this.resolvedActions.map(action => action.call.bind(action));
        return Promise.all(promises.map(m => m(results)));
    }
}
