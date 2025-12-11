const got = require('got');
const DescriptorBuilder = require('../utils/descriptorBuilder');
const Group = require('../models/Group');

module.exports = function (app) {
    const config = app.config;

    const Controller = {}

    Controller.own_layers = async function(request, response) {
        const { lang } = request.query;

        const url = String(`${process.env.OWS_API}/map/layers?lang=${language}`)

        const result = []

        try {
            const allResponse = await got(url);
            const allJson = JSON.parse(allResponse.body)

            const layersFile = fs.readFileSync("./descriptor/layers.json", 'utf8');
            const layersJson = JSON.parse(layersFile);

            Object.keys(layersJson).forEach(key => {
                result.push(Group.buildOwn(layersJson[key], allJson[key], lang))
            });

            response.send(result);
            response.end();
        } catch (error) {
            console.error('[DESCRIPTOR] Error while fetching own layers.\n\n', error);
        }
    }

    Controller.mapbiomas_layers = async function(request, response) {}

    Controller.own_limits = async function(request, response) {
        const { lang } = request.query;

        const url = String(`${process.env.OWS_API}/map/layers?lang=${language}`)

        const result = []

        try {
            const allResponse = await got(url);
            const allJson = JSON.parse(allResponse.body)

            const layersFile = fs.readFileSync("./descriptor/limits.json", 'utf8');
            const layersJson = JSON.parse(layersFile);

            Object.keys(layersJson).forEach(key => {
                result.push(Group.buildOwn(layersJson[key], allJson[key], lang))
            });

            response.send(result);
            response.end();
        } catch (error) {
            console.error('[DESCRIPTOR] Error while fetching own limits.\n\n', error);
        }
    }

    Controller.own_basemaps = async function(request, response) {
        const { lang } = request.query;

        const url = String(`${process.env.OWS_API}/map/layers?lang=${language}`)

        const result = []

        try {
            const allResponse = await got(url);
            const allJson = JSON.parse(allResponse.body)

            const layersFile = fs.readFileSync("./descriptor/basemaps.json", 'utf8');
            const layersJson = JSON.parse(layersFile);

            Object.keys(layersJson).forEach(key => {
                result.push(Group.buildOwn(layersJson[key], allJson[key], lang))
            });

            response.send(result);
            response.end();
        } catch (error) {
            console.error('[DESCRIPTOR] Error while fetching own basemaps.\n\n', error);
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
