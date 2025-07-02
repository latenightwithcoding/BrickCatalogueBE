// TextConvert.js
const TextConvert = {
    convertFromUnicodeEscape: (input) => {
        if (!input) return input;

        let output = '';
        for (let i = 0; i < input.length; i++) {
            if (input[i] === '\\' && i + 5 < input.length && input[i + 1] === 'u') {
                const unicode = input.substr(i + 2, 4);
                const code = parseInt(unicode, 16);
                if (!isNaN(code)) {
                    output += String.fromCharCode(code);
                    i += 5;
                    continue;
                }
            }
            output += input[i];
        }
        return output;
    },

    convertToUnicodeEscape: (input) => {
        if (!input) return input;

        let output = '';
        for (let char of input) {
            const code = char.charCodeAt(0);
            if ((code >= 0x00C0 && code <= 0x024F) || (code >= 0x1E00 && code <= 0x1EFF)) {
                output += `\\u${code.toString(16).padStart(4, '0')}`;
            } else {
                output += char;
            }
        }
        return output;
    },

    convertToUnSign: (s) => {
        if (!s) return s;

        const normalized = s.normalize('NFD');
        let result = '';
        for (let char of normalized) {
            const charCode = char.charCodeAt(0);
            const unicodeCategory = require('unicode-category');
            if (unicodeCategory.getCategory(charCode) !== 'Mn') {
                result += char;
            }
        }

        result = result.replace(/Đ/g, 'D').replace(/đ/g, 'd');
        result = result.replace(/\s+/g, '-');
        return result.normalize('NFC');
    }
};

module.exports = TextConvert;
