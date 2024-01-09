import {VBase} from './base';

export class VRunScript extends VBase {
    constructor(options, params, event, root) {
        super(options, root);

        this.script = params.script;
        this.event = event;
    }

    async call(results) {
        const func = new Function(['event'], this.script).bind(this.root);

        try {
            const content = func(this.event);
            // last_response expects to parse JSON, regardless of the result's content type.
            const json = JSON.stringify(content);

            results.push({action: 'run_script', statusCode: 200, content: json});
        } catch (error) {
            console.error(error);
            results.push({
                action: 'run_script',
                statusCode: 500,
                contentType: 'v/errors',
                content: {exception: error.message}
            });
        }

        return results;
    }
}
