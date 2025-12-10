const got = require('got');
const DescriptorBuilder = require('../utils/descriptorBuilder');

module.exports = function (app) {
    const config = app.config;

    const Controller = {}

    Controller.own_layers = async function(request, response) {
        const { lang } = request.query;

        let url = String(`${process.env.OWS_API}/map/layers?lang=${language}`)

        try {
            const response = await got(url);
            
            let json = JSON.parse(response.body)

            let result = DescriptorBuilder().getLayers(lang, json)

            response.send(result);
            response.end();
        } catch (error) {
            console.error('[DESCRIPTOR] Error while fetching own layers.\n\n', error);
        }
    }

    Controller.mapbiomas_layers = async function(request, response) {}

    Controller.own_limits = async function(request, response) {
        const { lang } = request.query;

        let url = String(`${process.env.OWS_API}/map/limits?lang=${language}`)

        try {
            const response = await got(url);
            
            let json = JSON.parse(response.body)

            let result = DescriptorBuilder().getLimits(lang, json)

            response.send(result);
            response.end();
        } catch (error) {
            console.error('[DESCRIPTOR] Error while fetching own layers.\n\n', error);
        }
    }

    Controller.own_basemaps = async function(request, response) {
        const { lang } = request.query;

        let url = String(`${process.env.OWS_API}/map/basemaps?lang=${language}`)

        try {
            const response = await got(url);
            
            let json = JSON.parse(response.body)

            let result = DescriptorBuilder().getBasemaps(lang, json)

            response.send(result);
            response.end();
        } catch (error) {
            console.error('[DESCRIPTOR] Error while fetching own layers.\n\n', error);
        }
    }

// ---------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------

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
