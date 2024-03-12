const lang = require('../utils/language');
const Layer = require('./layer')
const Auxiliar = require('../utils/auxiliar')

module.exports = class Group {

    languageOb;
    idGroup;
    labelGroup;
    groupExpanded;
    layers;

    constructor(language, params, layertypes) {

        try {
            this.languageOb = lang().getLang(language);
            this.idGroup = params.idGroup ? params.idGroup : null

            this.labelGroup = params.labelGroup == "translate" ? this.languageOb.descriptor_labels.groups[this.idGroup].labelGroup : params.labelGroup;

            this.groupExpanded = params.hasOwnProperty('groupExpanded') ? params.groupExpanded : false;

            if (params.hasOwnProperty('layers')) {
                this.layers = this.getLayersArray(language, params.layers, layertypes);
            }

        } catch (error) {
            console.error("ERRO no IDGROUP: ", this.idGroup)
        }
    }

    getLayersArray(language, layers, layertypes) {
        var arr = [];
        var temp_id = this.idGroup

        try {

            for (const [key, layer] of Object.entries(layers)) {
                let layerInstance = new Layer(language, layer, temp_id, layertypes);
                arr.push(layerInstance.getLayerInstance());
            }


        } catch (error) {
            //=> 'Internal server error ...'
        }

        return arr;
    }


    getGroupInstance() {
        var ob = {
            "idGroup": this.idGroup,
            "labelGroup": this.labelGroup,
            "groupExpanded": this.groupExpanded,
            "layers": this.layers
        }

        ob = Auxiliar.removeNullProperties(ob)

        return ob;
    }

}