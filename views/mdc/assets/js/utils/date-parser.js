const UNICODE_NUMERAL = /\p{N}/giu;

export class DateParser {
    constructor(formatter = new Intl.DateTimeFormat(navigator.languages)) {
        this.formatter = formatter;
    }

    parse(dateString) {
        const parts = this.formatter.formatToParts();
        const codePoints = Array.from(String(dateString));
        const accumulator = {
            day: [],
            month: [],
            year: [],
        };
        let c = codePoints.shift();

        for (const {type} of parts) {
            switch (type) {
            case 'day':
            case 'month':
            case 'year':
            case 'relatedYear':
                // capture a span of unicode numerals:
                while (c && c.match(UNICODE_NUMERAL)) {
                    accumulator[type].push(transliterateNumber(c));
                    c = codePoints.shift();
                }
                break;
            default:
                // consume a span of non-numeric code points:
                while (c != null && !c.match(UNICODE_NUMERAL)) {
                    c = codePoints.shift();
                }
                break;
            }
        }

        const day = parseInt(accumulator.day.join(''));
        const month = parseInt(accumulator.month.join(''));
        const year = parseInt(accumulator.year.join(''));

        if (isNaN(day) || isNaN(month) || isNaN(year)) {
            console.warn('Invalid date:', dateString);
            return null;
        }

        const monthIndex = month - 1; // months in JS start at 0!
        const date = new Date(year, monthIndex, day);

        if (isNaN(date.getTime())) {
            // day, month, and year may be valid integers (as per parseInt), but they may not
            // collectively make a valid date.
            console.warn('Invalid date:', dateString);
            return null;
        }

        // flag overflow as invalid:
        if ((date.getFullYear() != year && date.getYear() != year)
            || date.getMonth() != monthIndex
            || date.getDate() != day) {
            console.warn('Invalid date (overflow):', dateString);
            return null;
        }

        console.debug('DateTime: parsed', dateString, 'as', date);

        return date.toISOString().substring(0, 10); // just date, without time and zone components
    }
}

/**
 * Transliterates a numeral code point to an (Western) Arabic number.
 *
 * Western Arabic, Eastern Arabic (Indo-Arabic), Persian, and Urdu numerals are supported (though
 * Western Arabic numerals are returned as-is, of course).
 * Abjad numerals are not supported, as there is no value for zero in the Abjad numeral system.
 * @param {String} codePoint The numeral code point to transliterate
 * @return {String}
 */
function transliterateNumber(codePoint) {
    return codePoint.replace(/[\u0660-\u0669\u06f0-\u06f9]/g, (s) => s.charCodeAt(0) & 0xf);
}
