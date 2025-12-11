const fs = require('fs');

module.exports = function (app) {
    let Language = {}

    Language.getLang = function (lang) {
        const file = `${process.env.LANGUAGE_DIR}${lang}.json`

        try {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        }catch (error) {
            console.error("[LANGUAGE] Error while fetching language json.", error)
        }
    }

    return Language;
}