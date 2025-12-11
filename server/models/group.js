const Layer = require('./Layer')

const lang = require('../utils/language');

module.exports = class Group {

    id;
    label;
    layers;

    constructor(id, label, layers) {
        this.id = id;
        this.label = label;
        this.layers = layers;
    }

    static buildOwn(key, json, data, lang) {
        const langObj = lang().getLang(language);

        try {
            if (!json.hasOwnProperty('layers')) throw new Error("Objeto não possui a propriedade 'layers'");

            const label = langObj.descriptor_labels.groups[key].labelGroup;

            const layers = json['layers'].map(layer => {
                return new Layer.buildOwn(layer, data, lang)
            });

            return new Group(key, label, layers)
        } catch (error) {
            console.error("[GROUP] Erro while building group object.", error)
        }
    }

    static fromMapbiomas() {}

    getGroupInstance() {
        const obj = {
            "id": this.id,
            "label": this.label,
            "layers": this.layers.map(layer => layer.getGroupInstance)
        }

        return obj;
    }
}