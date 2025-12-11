const fs = require('fs');

// TODO: As traduções deveriam ser carregadas direto na env
// ao inves de ter que ser carregada todas vez. Isso provavelmente esta gerando
// delay na chamada de apis que precisam do arquivo.

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