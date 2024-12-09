const got = require('got');
const DescriptorBuilder = require('../utils/descriptorBuilder');

module.exports = function (app) {
    const config = app.config;

    const Controller = {}

    const fetchLayerTypes = async function (language, type = 'layers') {
        let data = {}
        let url = String(process.env.OWS_API + "/map/" + type + "?lang=" + language)
        
        try {
            const response = await got(url);
            
            data = JSON.parse(response.body)

            return data;
        } catch (error) {
            console.error('[DESCRIPTOR] Error while fetching descriptor.\n\n', error);
        }
    }

    Controller.descriptor = async function (request, response) {
        const { lang } = request.query;
        
        try {
            let layertypes = await fetchLayerTypes(lang, 'layers')
            let basemapsTypes = await fetchLayerTypes(lang, 'basemaps')
            let limitsTypes = await fetchLayerTypes(lang, 'limits')

            const result = {
                groups: DescriptorBuilder().getLayers(lang, layertypes),
                basemaps: DescriptorBuilder().getBasemaps(lang, basemapsTypes),
                limits: DescriptorBuilder().getLimits(lang, limitsTypes),
            }
            
            response.send(result);
            response.end();
        } catch (error) {
            console.error('[DESCRIPTOR] Error while fetching descriptor.\n\n', error)
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

        const queryResult = request.queryResult['search']

        let iniResults = []

        queryResult.forEach(function (row) {
            delete row.priority
            iniResults.push(row)
        })

        let result = [...new Map(iniResults.map(item => [item['value'], item])).values()]

        response.send({ search: result })
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
