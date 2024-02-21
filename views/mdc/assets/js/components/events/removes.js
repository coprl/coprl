export class VRemoves {
    constructor(options, params, event, root) {
        this.target = options.target;
        this.ids = params.ids;
        this.event = event;
        this.root = root;
    }

    async call(results) {
        results.push({action: 'removes', statusCode: 200});

        for (const id of this.ids) {
            const element = this.root.getElementById(id);

            if (element) {
                element.remove();
            }
            else {
                console.log(`remove: no element with ID "${id}"`);
            }
        }

        return results;
    }
}
