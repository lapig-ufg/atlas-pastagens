const got = require('got');
const DescriptorBuilder = require('../utils/descriptorBuilder');

module.exports = function (app) {
    const Controller = {}

    const config = app.config;

    Controller.callServiceToObtainLayerTypes = async function (language, type = 'layers') {
        let res = {}
        let url = String(process.env.OWS_API + "/map/" + type + "?lang=" + language)
        try {
            const response = await got(url);
            res = JSON.parse(response.body)

            return res;

        } catch (error) {
            console.log(error.response.body);
            //=> 'Internal server error ...'
        }
    }

    Controller.descriptor = async function (request, response) {
        const { lang } = request.query;
        try {
            let layertypes = await Controller.callServiceToObtainLayerTypes(lang, 'layers')
            let basemapsTypes = await Controller.callServiceToObtainLayerTypes(lang, 'basemaps')
            let limitsTypes = await Controller.callServiceToObtainLayerTypes(lang, 'limits')

            const result = {
                // regionFilterDefault: "bioma='CERRADO'", // Non-obrigatory property to define a filter to Region applied to EVERY layer.
                groups: DescriptorBuilder().getGroupLayers(lang, layertypes),
                basemaps: DescriptorBuilder().getBasemapsOrLimitsLayers(lang, 'basemaps', basemapsTypes),
                limits: DescriptorBuilder().getBasemapsOrLimitsLayers(lang, 'limits', limitsTypes),
            }

            response.send(result);
            response.end();
        } catch (e) {
            console.log(e)
        }
    };

    Controller.extent = function (request, response) {
        const queryResult = request.queryResult['extent']
        const result = {
            type: 'Feature',
            geometry: JSON.parse(queryResult[0].geojson)
        }

        response.send(result)
        response.end();

    }

    Controller.search = function (request, response) {
        var regiao;
        var result = [];
        var queryResult = request.queryResult

        queryResult.forEach(function (row) {

            if (row.uf === null) {
                regiao = row.text
            } else {
                regiao = row.text + " (" + row.uf + ")"
            }

            result.push({
                text: regiao,
                value: row.value,
                type: row.type
            })
        })

        response.send(result)
        response.end()
    }


    Controller.host = function (request, response) {

        var baseUrls = config.ows_domains.split(",");

        for (let i = 0; i < baseUrls.length; i++) {
            baseUrls[i] += "/ows"
        }

        response.send(baseUrls);
        response.end();
    }

    return Controller;

}