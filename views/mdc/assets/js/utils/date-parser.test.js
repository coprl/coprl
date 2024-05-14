import {DateParser} from './date-parser';

describe('parse', () => {
    describe('en-US', () => {
        const subject = new DateParser(new Intl.DateTimeFormat('en-US'));
        const valid = {
            '6/10/91': '1991-06-10',
            '06/10/91': '1991-06-10',
            '6/10/1991': '1991-06-10',
            '06/10/1991': '1991-06-10',
        };

        for (const [input, output] of Object.entries(valid)) {
            it(`parses "${input}" as ${output}`, () => {
                expect(subject.parse(input)).toEqual(output);
            });
        }
    });

    describe('en-GB', () => {
        const subject = new DateParser(new Intl.DateTimeFormat('en-GB'));
        const cases = {
            '15/5/99': '1999-05-15',
            '15/05/99': '1999-05-15',
            '15/5/1999': '1999-05-15',
            '15/05/1999': '1999-05-15',
        };

        for (const [input, output] of Object.entries(cases)) {
            it(`parses "${input}" as ${output}`, () => {
                expect(subject.parse(input)).toEqual(output);
            });
        }
    });

    describe('en-CA', () => {
        const subject = new DateParser(new Intl.DateTimeFormat('en-CA'));
        const cases = {
            '99-5-15': '1999-05-15',
            '99-05-15': '1999-05-15',
            '1999-5-15': '1999-05-15',
            '1999-05-15': '1999-05-15',
        };

        for (const [input, output] of Object.entries(cases)) {
            it(`parses "${input}" as ${output}`, () => {
                expect(subject.parse(input)).toEqual(output);
            });
        }
    });

    describe('with invalid input', () => {
        const subject = new DateParser(new Intl.DateTimeFormat('en-US'));
        const invalid = [
            'foo',
            '',
            true,
            false,
            10,
            -1,
            3.14159,
            null,
            undefined,
            '99/99/99',
            '02/31/1999',
            '00/00/0000',
        ];

        for (const input of invalid) {
            it(`fails to parse ${input}`, () => {
                expect(subject.parse(input)).toEqual(null);
            });
        }
    });
});
