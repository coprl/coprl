/**
 * @jest-environment jsdom
 */

import {ActionError, VErrors} from "./errors"

function mockResult({statusCode = 422, contentType, content} = {}) {
    return {
        action: "mockResult",
        statusCode,
        contentType,
        content
    }
}

describe(`clearErrors`, () => {
    it(`removes all .v-error-message elements`, () => {
        document.body.innerHTML = `
            <span>Hello, world!</span>
            <div class="v-error-message">Unable to authenticate. Please check your password.</div>
        `

        const subject = new VErrors(document, null)
        expect(document.querySelectorAll('.v-error-message').length).toEqual(1)
        subject.clearErrors()
        expect(document.querySelectorAll('.v-error-message').length).toEqual(0)
    })
})

describe(`displayErrors`, () => {
    beforeEach(() => {
        // jsdom does not implement HTMLElement.scrollIntoView.
        window.HTMLElement.prototype.scrollIntoView = jest.fn()
    })

    describe(`for an error with an element`, () => {
        const result = mockResult({contentType: 'application/json', statusCode: 422, content: `
            {
                "errors": {
                    "title": ["must be filled", "must be between 1 and 10 characters long"]
                },
                "warnings": {},
                "snackbar": []
            }
        `})

        it(`renders the error in the element's helper text`, () => {
            document.body.innerHTML = require('../../__test__/fixtures/input_field.html.js')
            const subject = new VErrors(document, null)
            subject.displayErrors(result)

            const helperTextElement = document.querySelector('.mdc-text-field-helper-text')
            expect(helperTextElement.textContent).toContain('must be filled, must be between 1 and 10 characters long')
        })
    })

    describe(`for a nested validation error with an element`, () => {
        const result = mockResult({contentType: 'application/json', statusCode: 422, content: `
            {
                "errors": {
                    "address": {
                        "ln1": ["must be filled", "must be a street address"]
                    }
                },
                "warnings": {},
                "snackbar": []
            }
        `})

        it(`renders the error in the element's helper text`, () => {
            document.body.innerHTML = require('../../__test__/fixtures/nested_input_field.html.js')
            const subject = new VErrors(document, null)
            subject.displayErrors(result)

            const helperTextElement = document.querySelector('.mdc-text-field-helper-text')
            expect(helperTextElement.textContent).toContain('must be filled, must be a street address')
        })
    })

    describe(`for an error with no element reference`, () => {
        const result = mockResult({
            contentType: 'v/errors',
            statusCode: 500,
            content: {exception: 'Something bad happened'}
        })

        it(`renders the error in an error container`, () => {
            document.body.innerHTML = require('../../__test__/fixtures/input_field.html.js')
            const subject = new VErrors(document, null)
            subject.displayErrors(result)

            expect(document.querySelector('.v-error-message').innerHTML).toContain("Something bad happened")
        })
    })

    describe(`for a nested validation error when an error group element is present`, () => {
        const result = mockResult({contentType: 'application/json', statusCode: 422, content: `
            {
                "errors": {
                    "address": {
                        "ln1": ["Address line 1 must be filled and must be a street address"]
                    }
                },
                "warnings": {},
                "snackbar": []
            }
        `})

        it(`renders the error in the proxy error group element`, () => {
            document.body.innerHTML = require('../../__test__/fixtures/error_group.html.js')
            const subject = new VErrors(document, null)
            subject.displayErrors(result)

            const errorMessage = document.querySelector('[data-error-group="address"] .v-error-message')
            expect(errorMessage.innerHTML).toContain("Address line 1 must be filled and must be a street address")
        })
    })
})

describe(`normalize`, () => {
    // case A
    describe(`for a client-side exception`, () => {
        const result = new TypeError("I'm sorry, Dave. I'm afraid that's the wrong type.");
        const subject = new VErrors(document, null);

        it(`returns an error without an element reference`, () => {
            const subject = new VErrors(document, null)
            const errors = subject.normalize(result)

            expect(errors).toHaveLength(1)
            expect(errors[0]).toHaveProperty("element", null)
        })

        it(`returns an error containing the eception's message`, () => {
            const subject = new VErrors(document, null)
            const errors = subject.normalize(result)

            expect(errors).toHaveLength(1)
            expect(errors[0]).toHaveProperty("message", "I'm sorry, Dave. I'm afraid that's the wrong type.")
        })
    })

    // case B
    describe(`for a (non-validation) server error`, () => {
        const result = mockResult({statusCode: 500, contentType: 'application/json', content: `
            ["undefined method \`map\' for nil:NilClass"]
        `})

        it(`returns an error without an element reference`, () => {
            const subject = new VErrors(document, null)
            const errors = subject.normalize(result)

            expect(errors).toHaveLength(1)
            expect(errors[0]).toHaveProperty("element", null)
        })

        it(`returns an error containing the original server error's message`, () => {
            const subject = new VErrors(document, null)
            const errors = subject.normalize(result)

            expect(errors).toHaveLength(1)
            expect(errors[0]).toHaveProperty("message", "undefined method `map' for nil:NilClass")
        })
    })

    // case C
    describe(`for a server-side validation error`, () => {
        // case C1
        describe(`with an array of error messages`, () => {
            const result = mockResult({contentType: 'application/json', content: `
                {
                    "errors": {
                        "title": ["must be filled", "must be between 1 and 10 characters long"]
                    },
                    "warnings": {},
                    "snackbar": []
                }
            `})

            it(`returns an error for the title field`, () => {
                const subject = new VErrors(document, null)
                const errors = subject.normalize(result)

                expect(errors).toHaveLength(1)
                expect(errors[0]).toHaveProperty("element", "title")
            })

            it(`returns an error containing a validation message`, () => {
                const subject = new VErrors(document, null)
                const errors = subject.normalize(result)

                expect(errors).toHaveLength(1)
                expect(errors[0]).toHaveProperty("message", "must be filled, must be between 1 and 10 characters long")
            })
        })

        // case C2
        describe(`with a single error message`, () => {
            const result = mockResult({contentType: 'application/json', content: `
                {
                    "errors": {
                        "title": "must be filled"
                    },
                    "warnings": {},
                    "snackbar": []
                }
            `})

            it(`returns an error for the title field`, () => {
                const subject = new VErrors(document, null)
                const errors = subject.normalize(result)

                expect(errors).toHaveLength(1)
                expect(errors[0]).toHaveProperty("element", "title")
            })

            it(`returns an error containing a validation message`, () => {
                const subject = new VErrors(document, null)
                const errors = subject.normalize(result)

                expect(errors).toHaveLength(1)
                expect(errors[0]).toHaveProperty("message", "must be filled")
            })
        })

        // case C3
        describe(`with an array of error messages for a nested field`, () => {
            const result = mockResult({contentType: 'application/json', content: `
                {
                    "errors": {
                        "address": {
                            "ln1": ["must be filled", "must be a street address"]
                        }
                    },
                    "warnings": {},
                    "snackbar": []
                }
            `})

            it(`returns an error for the address[ln1] field`, () => {
                const subject = new VErrors(document, null)
                const errors = subject.normalize(result)

                expect(errors).toHaveLength(1)
                expect(errors[0]).toHaveProperty("element", "address[ln1]")
            })

            it(`returns an error containing a validation message`, () => {
                const subject = new VErrors(document, null)
                const errors = subject.normalize(result)

                expect(errors).toHaveLength(1)
                expect(errors[0]).toHaveProperty("message", "must be filled, must be a street address")
            })
        })

        // case C4
        describe(`with a single error message for a nested field`, () => {
            const result = mockResult({contentType: 'application/json', content: `
                {
                    "errors": {
                        "address": {
                            "ln1": "must be filled"
                        }
                    },
                    "warnings": {},
                    "snackbar": []
                }
            `})

            it(`returns an error for the address[ln1] field`, () => {
                const subject = new VErrors(document, null)
                const errors = subject.normalize(result)

                expect(errors).toHaveLength(1)
                expect(errors[0]).toHaveProperty("element", "address[ln1]")
            })

            it(`returns an error containing a validation message`, () => {
                const subject = new VErrors(document, null)
                const errors = subject.normalize(result)

                expect(errors).toHaveLength(1)
                expect(errors[0]).toHaveProperty("message", "must be filled")
            })
        })
    })

    // case D
    describe(`for a client-side validation error`, () => {
        const result = mockResult({statusCode: 422, contentType: 'v/errors', content: [
            {"title": "Please fill out this field."}
        ]})

        it(`returns an error with an element reference`, () => {
            const subject = new VErrors(document, null);
            const errors = subject.normalize(result);

            expect(errors).toHaveLength(1)
            expect(errors[0]).toHaveProperty("element", "title")
        })

        it(`returns an error with a message containing validation info`, () => {
            const subject = new VErrors(document, null);
            const errors = subject.normalize(result);
            expect(errors).toHaveLength(1)
            expect(errors[0]).toHaveProperty("message", "Please fill out this field.")
        })
    });

    // case E
    describe(`for a (non-validation) client-side error`, () => {
        const result = mockResult({contentType: 'v/errors', content: {
            exception: "Oh no, something happened"
        }})

        it(`returns an error containing the exception's message`, () => {
            const subject = new VErrors(document, null)
            const errors = subject.normalize(result);
            expect(errors).toHaveLength(1)
            expect(errors[0]).toHaveProperty("message", "Oh no, something happened")
        })
    })

    // case F
    describe(`for a network problem`, () => {
        const result = mockResult({statusCode: 0, content: ""})

        it(`returns an error containing a generic connectivity error`, () => {
            const subject = new VErrors(document, null)
            const errors = subject.normalize(result);
            expect(errors).toHaveLength(1)
            expect(errors[0]).toHaveProperty("message", "Network error: verify connection and try again.")
        })
    })

    // case G
    describe(`for some other unknown problem`, () => {
        const result = mockResult({statusCode: 418, content: ""})

        it(`returns an error containing the HTTP status code`, () => {
            const subject = new VErrors(document, null)
            const errors = subject.normalize(result);
            expect(errors).toHaveLength(1)
            expect(errors[0]).toHaveProperty("message", "An unexpected error occurred. (HTTP 418)")
        })
    })
})
