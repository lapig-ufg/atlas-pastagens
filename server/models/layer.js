const lang = require('../utils/language');
const Auxiliar = require('../utils/auxiliar');

module.exports = class Layer {

    id;
    label;
    types;

    constructor(id, label, types) {
        this.id = id;
        this.label = label;
        this.types = types;
    }

    static buildOwn(layer, data, lang) {
        const langObj = lang().getLang(lang);

        try {
            if (!params.hasOwnProperty('types')) throw new Error("Object doesn't have property 'types'");

            const label = langObj.descriptor_labels.groups[this.idGroup].layers[this.id].labelLayer;
            
            const types = layer['types'].map((type) => {
                const obj = data.find(element => type.toUpperCase() === element['valueType'].toUpperCase())
                return obj ? obj : null;
            }).filter(element => element !== null)

            return Layer(layer['id'], label, types)
        } catch (error) {
            console.error("[LAYER] Error while building own layer.", error);
        }
    }

    getLayerInstance() {
        let obj = {
            "id": this.id,
            "label": this.label,
            "types": this.types,
        }
        
        return obj;
    }
}