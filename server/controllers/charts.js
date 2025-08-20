const UtilsLang = require('../utils/language');


module.exports = function (app) {
    var Controller = {}
    var Internal = {}


    Internal.numberFormat = function (numero) {
        numero = numero.toFixed(2).split('.');
        numero[0] = numero[0].split(/(?=(?:...)*$)/).join('.');
        return numero.join(',');
    }

    Internal.replacementStrings = function (template, replacements) {
        return template.replace(/#([^#]+)#/g, (match, key) => {
            return replacements[key] !== undefined
                ? replacements[key] : "";
        });
    }

    Internal.buildGraphResult = function (allQueriesResult, chartDescription) {
        var dataInfo = {}

        try {
            let arrayLabels = []
            let arrayData = []

            for (let query of chartDescription.idsOfQueriesExecuted) {
                // TODO: allQueriesResult should be an object with query.idOfQuery as key.
                // but instead it is undefined.
                let queryInd = allQueriesResult[query.idOfQuery]
                let colors = [...new Set(queryInd.map(a => a.color))]

                arrayLabels.push(...queryInd.map(a => (typeof a.label == 'number' ? Number(a.label) : String(a.label))))
                if (chartDescription.type == 'line') {
                    if (typeof query.labelOfQuery === 'string') {
                        arrayData.push({
                            label: query.labelOfQuery,
                            data: [...queryInd.map(a => (typeof a.value === 'string' || a.value instanceof String ? parseFloat(a.value) : Number(a.value)))],
                            fill: false,
                            borderColor: colors,
                            tension: .4
                        })
                    }
                    else {
                        for (const [keyLabelQuery, valueLabelQuery] of Object.entries(query.labelOfQuery)) {
                            let keyLabel = {
                                'class_1': 'Ausente',
                                'class_2': 'Intermediário',
                                'class_3': 'Severa'
                            }[keyLabelQuery]

                            arrayData.push({
                                label: valueLabelQuery,
                                data: [...queryInd.filter(ob => ob.classe == keyLabel).map(a => (typeof a.value === 'string' || a.value instanceof String ? parseFloat(a.value) : Number(a.value)))],
                                fill: false,
                                borderColor: [...new Set(queryInd.filter(a => a.classe == keyLabel).map(ob => ob.color))],
                                tension: .4
                            })
                        }
                    }
                }
                else if (chartDescription.type == 'pie' || chartDescription.type == 'doughnut') {
                    if (typeof query.labelOfQuery === 'string') {
                        arrayData.push({
                            label: query.labelOfQuery,
                            data: [...queryInd.map(a => (typeof a.value === 'string' || a.value instanceof String ? parseFloat(a.value) : Number(a.value)))],
                            backgroundColor: [...new Set(queryInd.map(element => element.color))],
                            hoverBackgroundColor: [...new Set(queryInd.map(element => element.color))],
                        })
                    }
                    else {
                        arrayData.push({
                            label: query.idOfQuery,
                            data: [...queryInd.map(a => (typeof a.value === 'string' || a.value instanceof String ? parseFloat(a.value) : Number(a.value)))],
                            backgroundColor: [...new Set(queryInd.map(element => element.color))],
                            hoverBackgroundColor: [...new Set(queryInd.map(element => element.color))],
                        })
                    }
                }
                else if (chartDescription.type == 'bar' || chartDescription.type == 'horizontalBar') {
                    if (typeof query.labelOfQuery === 'string') {
                        arrayData.push({
                            label: query.labelOfQuery,
                            data: [...queryInd.map(a => (typeof a.value === 'string' || a.value instanceof String ? parseFloat(a.value) : Number(a.value)))],
                            backgroundColor: colors,
                        })
                    }
                    else {
                        for (const [keyLabelQuery, valueLabelQuery] of Object.entries(query.labelOfQuery)) {
                            arrayData.push({
                                label: valueLabelQuery,
                                data: [...queryInd.filter(ob => ob.classe == keyLabelQuery).map(a => (typeof a.value === 'string' || a.value instanceof String ? parseFloat(a.value) : Number(a.value)))],
                                backgroundColor: [...new Set(queryInd.filter(a => a.classe == keyLabelQuery).map(ob => ob.color))],
                            })
                        }
                    }
                }
            }
            dataInfo = {
                labels: [...new Set(arrayLabels)],
                datasets: [...arrayData]
            }
        }
        catch (e) {
            dataInfo = null
        }

        return dataInfo;
    }

    Internal.buildTableData = function (allQueriesResult, chartDescription) {
        let dataInfo = []

        try {
            for (let query of chartDescription.idsOfQueriesExecuted) {
                let queryInd = allQueriesResult[query.idOfQuery]
                let index = 1;

                for (let i = 0; i < queryInd.length; i++) {
                    queryInd[i].originalValue = parseFloat(queryInd[i].value)
                    queryInd[i].index = index++ + 'º'
                    queryInd[i].value = String(Internal.numberFormat(parseFloat(queryInd[i].value)) + " ha")
                }

                dataInfo = [...queryInd]
            }
        }
        catch (error) {
            dataInfo = null
        }

        return dataInfo;
    };

    Controller.handleResumo = function (request, response) {
        const { lang, card_resume } = request.query;
 
        Internal.languageOb = UtilsLang().getLang(lang).right_sidebar;

        var result;

        switch (card_resume) {
            case 'region':
                result = {
                    route: 'region',
                    data: {
                        area: request.queryResult['region'][0].area_region,
                    }
                }
                break;
            case 'carbono':
                result = {
                    route: 'carbono',
                    data: request.queryResult['pasture_carbon_somsc'][0]
                };
                break;
            default:
                result = {data: 'Invalid argument'};
                break;
        }

        try {
            response.send(result.data);
        } catch (error) {
            console.error(result.route);
        }

        response.end();
    };

    Controller.handlePastureGraphData = function (request, response) {
        const { lang, typeRegion, textRegion } = request.query;

        Internal.languageOb = UtilsLang().getLang(lang).right_sidebar;

        let replacements = {
            typeRegionTranslate: Internal.languageOb.region_types[typeRegion],
            textRegionTranslate: textRegion,
        };

        const chartResult = [
            {
                "id": "carbono",
                "idsOfQueriesExecuted": [
                    { idOfQuery: 'pasture_carbon', labelOfQuery: Internal.languageOb["pastureGraph_card"]["carbon"].labelOfQuery['carbon'] },
                ],
                "title": Internal.languageOb["pastureGraph_card"]["carbon"].title,
                "getText": function (chart) {
                    const text = Internal.replacementStrings(Internal.languageOb["pastureGraph_card"]["carbon"].text, replacements)
                    return text
                },
                "type": 'line',
                "options": {
                    legend: {
                        display: false
                    }
                }
            },
        ]

        let chartFinal = []

        for (let chart of chartResult) {
            chart['data'] = Internal.buildGraphResult(request.queryResult, chart)

            chart['show'] = false

            if (chart['data']) {
                chart['show'] = true
                chart['text'] = chart.getText(request.queryResult, chart.idsOfQueriesExecuted)
            } else {
                chart['data'] = {};
                chart['show'] = false;
                chart['text'] = "erro."
            }

            chartFinal.push(chart);
        }

        response.send(chartFinal)
        response.end();
    };

    return Controller;
}
