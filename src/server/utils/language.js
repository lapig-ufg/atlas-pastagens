const fs = require('fs');

module.exports = function (app) {
    let Language = {}

    Language.getLang = function (lang) {
        const file = process.env.LANGUAGE_DIR + lang +'.json';
        try {
            let obj = JSON.parse(fs.readFileSync(file, 'utf8'));
            return obj;
        }catch (e) {
            console.error(e)
        }
    }

    return Language;
}