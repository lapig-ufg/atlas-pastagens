const lang = require('../utils/language');
const Auxiliar = require('../utils/auxiliar')

module.exports = class Layer {

    languageOb;
    idLayer;
    idGroup;
    labelLayer;
    visible;
    selectedType;
    layerTypes;
    language;

    constructor(language, params, idGroup, allLayersT) {
        this.language = language
        this.languageOb = lang().getLang(language);

        this.idGroup = idGroup ? idGroup : null;
        this.idLayer = params.idLayer;


        if (params.hasOwnProperty('types')) {
            this.layerTypes = this.getLayerTypesArray(params.types, allLayersT)
        }

        if (this.idLayer == 'limits' || this.idLayer == 'basemaps') {
            this.labelLayer = this.languageOb.descriptor_labels[this.idLayer].labelLayer;
        }
        else {
            if (params.labelLayer.toLowerCase() == "translate".toLowerCase()) {
                this.labelLayer = this.languageOb.descriptor_labels.groups[this.idGroup].layers[this.idLayer].labelLayer;
            }
            else {
                this.labelLayer = params.labelLayer
            }
        }
        this.visible = params.hasOwnProperty('visible') ? params.visible : false;

        this.selectedType = params.hasOwnProperty('selectedType') ? params.selectedType : this.layerTypes[0].valueType;
    }

    encode_superscript(text) {
        var map = {
            "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "a": "ᵃ", "b": "ᵇ",
            "c": "ᶜ", "d": "ᵈ", "e": "ᵉ", "f": "ᶠ", "g": "ᵍ", "h": "ʰ", "i": "ᶦ", "j": "ʲ", "k": "ᵏ", "l": "ˡ", "m": "ᵐ", "n": "ⁿ", "o": "ᵒ",
            "p": "ᵖ", "q": "ᑫ", "r": "ʳ", "s": "ˢ", "t": "ᵗ", "u": "ᵘ", "v": "ᵛ", "w": "ʷ", "x": "ˣ", "y": "ʸ", "z": "ᶻ", "A": "ᴬ", "B": "ᴮ", "C": "ᶜ", "D": "ᴰ",
            "E": "ᴱ", "F": "ᶠ", "G": "ᴳ", "H": "ᴴ", "I": "ᴵ", "J": "ᴶ", "K": "ᴷ", "L": "ᴸ", "M": "ᴹ", "N": "ᴺ", "O": "ᴼ", "P": "ᴾ", "Q": "Q", "R": "ᴿ", "S": "ˢ",
            "T": "ᵀ", "U": "ᵁ", "V": "ⱽ", "W": "ᵂ", "X": "ˣ", "Y": "ʸ", "Z": "ᶻ", "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾"
        };
        var charArray = text.split("");
        for (var i = 0; i < charArray.length; i++) {
            if (map[charArray[i].toLowerCase()]) {
                charArray[i] = map[charArray[i]];
            }
        }
        text = charArray.join("");
        return text;
    }

    replacementStrings(template, replacements) {
        return template.replace(/{{([^#]+)}}/g, (match, key) => {
            // If there's a replacement for the key, return that replacement with a `<br />`. Otherwise, return a empty string.
            return replacements[key] !== undefined
                ? replacements[key]
                : "";
        });
    }

    getLayerTypesArray(layertypes, alllayertypes) {

        let layertypesV = []
        layertypes.forEach(function (userSelectedLayerTypeValue, index) {
            for (var k in alllayertypes) {

                let ob = alllayertypes[k].find(obj => {
                    return obj.valueType.toUpperCase() === userSelectedLayerTypeValue.toUpperCase()
                })

                if (ob) {
                    layertypesV.push(Object.assign({}, ob))
                }

            }
        });

        return layertypesV;
    }

    getLayerInstance() {
        let ob = {
            "idLayer": this.idLayer,
            "labelLayer": this.labelLayer,
            "visible": this.visible,
            "selectedType": this.selectedType,
            "types": this.layerTypes
        }
        return ob;
    }

}