import {expandParams} from "./action_parameter";
import {VBase, htmlToNodes} from "./base";
import {initialize} from "../initialize";

/**
 * Appends the fetched HTML contents of the provided URL to an existing DOM node.
 *
 * Each node returned by the URL is inserted before the end of the target node, then initialized.
 */
export class VAppends extends VBase {
    constructor(options, url, params, event, root) {
        super(options, root);

        this.element_id = options.target;
        this.url = url;
        this.params = params;
        this.event = event;
    }

    get shouldValidate() {
        return this.options.validate || false;
    }

    async call(results, eventParams = []) {
        this.clearErrors();

        const root = this.root;
        const elementId = this.element_id;
        const nodeToReplace = root.getElementById(elementId);
        const expandedParams = expandParams(results, this.params);
        const inputVals = this.inputValues().filter((vals) => {
          return !this.options.ignore_input_values.includes(vals[0]);
        });
        const paramsCollection = [expandedParams, eventParams, inputVals];
        const url = this.buildURL(this.url, ...paramsCollection);

        if (!nodeToReplace) {
            results.push({
                action: "appends",
                statusCode: 500,
                contentType: "v/errors",
                content: {exception: `Unable to locate node #${elementId}`}
            });

            return Promise.reject(results);
        }

        if (this.shouldValidate) {
            const errors = this.validate();

            if (errors.length > 0) {
                results.push({
                    action: "appends",
                    statusCode: 422,
                    contentType: "v/errors",
                    content: errors
                })

                return Promise.reject(results);
            }
        }

        const response = await fetch(url, {headers: {"X-NO-LAYOUT": true}});
        const text = (await response.text()).trim();

        if (!response.ok) {
            results.push({
                action: "appends",
                statusCode: response.status,
                contentType: response.headers.get("Content-Type"),
                content: text
            });

            return Promise.reject(results);
        }

        const nodes = Array.from(htmlToNodes(text, root));

        for (const node of nodes) {
            nodeToReplace.insertAdjacentElement("beforeend", node);
            initialize(node);
        }

        results.push({
            action: "appends",
            statusCode: response.status,
            contentType: response.headers.get("Content-Type"),
            content: text,
        });

        return results;
    }
}
