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
                let queryInd = allQueriesResult[query.idOfQuery]
                let colors = [...new Set(queryInd.map(a => a.color))]

                arrayLabels.push(...queryInd.map(a => (typeof a.label == 'number' ? Number(a.label) : String(a.label))))

                if (chartDescription.type == 'line') {
                    if (typeof query.labelOfQuery === 'string') {
                        arrayData.push({
                            label: query.labelOfQuery,
                            data: [...queryInd.map(a => (typeof a.value === 'string' || a.value instanceof String ? parseFloat(a.value) : Number(a.value)))],
                            fill: false,
                            borderColor: [...new Set(queryInd.map(a => a.color))],
                            tension: .4
                        })
                    }
                    else {
                        for (const [keyLabelQuery, valueLabelQuery] of Object.entries(query.labelOfQuery)) {
                            arrayData.push({
                                label: valueLabelQuery,
                                data: [...queryInd.filter(ob => ob.classe == keyLabelQuery).map(a => (typeof a.value === 'string' || a.value instanceof String ? parseFloat(a.value) : Number(a.value)))],
                                fill: false,
                                borderColor: [...new Set(queryInd.filter(a => a.classe == keyLabelQuery).map(ob => ob.color))],
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
                            backgroundColor: [...new Set(queryInd.map(a => a.color))],
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
            case 'pasture':
                result = {
                    route: 'pasture',
                    data: {
                        area: request.queryResult['pasture'][0].value,
                        percentOfRegionArea: Internal.numberFormat(
                            (request.queryResult['pasture'][0].value / request.queryResult['region'][0].area_region) * 100) + "%"
                    }
                }
                break;
            case 'carbono':
                result = {
                    route: 'carbono',
                    data: request.queryResult['pasture_carbon_somsc'][0]
                };
            case 'pasture_quality':
                result = {
                    route: 'pasture_vigor',
                    data: request.queryResult['pasture_quality'].map(ob => {
                        ob.percentAreaPasture = Internal.numberFormat((ob.value / request.queryResult['pasture'][0].value) * 100) + "%"
                        ob.percentOfRegionArea = Internal.numberFormat((ob.value / request.queryResult['region'][0].area_region) * 100) + "%"
                        ob.classe = ob.classe
                        return ob;
                    })
                }
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
                "id": "pasture",
                "idsOfQueriesExecuted": [
                    { idOfQuery: 'pasture', labelOfQuery: Internal.languageOb["pastureGraph_card"]["pastureAndLotacaoBovina"].labelOfQuery['pasture'] },
                    { idOfQuery: 'lotacao_bovina_regions', labelOfQuery: Internal.languageOb["pastureGraph_card"]["pastureAndLotacaoBovina"].labelOfQuery['lotacao_bovina_regions'] },
                ],
                "title": Internal.languageOb["pastureGraph_card"]["pastureAndLotacaoBovina"].title,
                "getText": function (chart) {
                    const text = Internal.replacementStrings(Internal.languageOb["pastureGraph_card"]["pastureAndLotacaoBovina"].text, replacements)
                    return text
                },
                "type": 'line',
                "options": {
                    legend: {
                        display: false
                    }
                }
            },
            {
                "id": "pasture_quality",
                "idsOfQueriesExecuted": [
                    { idOfQuery: 'pasture_quality', labelOfQuery: Internal.languageOb["pastureGraph_card"]["pastureQuality"].labelOfQuery['pasture_quality'] },
                ],
                "title": Internal.languageOb["pastureGraph_card"]["pastureQuality"].title,
                "getText": function (queriesResult, query) {

                    const text = Internal.replacementStrings(Internal.languageOb["pastureGraph_card"]["pastureQuality"].text, replacements)
                    return text
                },
                "type": 'line',
                "options": {
                    legend: {
                        display: false
                    }
                }
            },
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

    Controller.handleArea2Data = function (request, response) {
        const { lang, typeRegion, textRegion, year } = request.query;

        let varYear = year
        if (!varYear) {
            varYear = 2021
        }

        Internal.languageOb = UtilsLang().getLang(lang).right_sidebar;

        let replacements = {
            typeRegionTranslate: Internal.languageOb.region_types[typeRegion],
            textRegionTranslate: textRegion,
        };

        const chartResult = [
            {
                "id": "pastureQualityPerYear",
                "idsOfQueriesExecuted": [
                    { idOfQuery: 'pasture_quality', labelOfQuery: Internal.languageOb["area2_card"]["pastureQualityPerYear"].labelOfQuery['pasture_quality'] },
                ],
                "title": Internal.languageOb["area2_card"]["pastureQualityPerYear"].title,
                "getText": function (queriesResult, query) {
                    replacements['areaPasture'] = Internal.numberFormat(Number(queriesResult[query[0].idOfQuery].reduce((n, { value }) => n + parseFloat(value), 0)))
                    replacements['yearTranslate'] = parseInt(varYear)

                    const text = Internal.replacementStrings(Internal.languageOb["area2_card"]["pastureQualityPerYear"].text, replacements)
                    return text
                },
                "type": 'pie',
                "options": {
                    plugins: {
                        legend: {
                            labels: {
                                color: '#495057'
                            }
                        }
                    }
                }
            }
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

    Controller.handleArea3Data = function (request, response) {
        const { lang, typeRegion, textRegion } = request.query;

        Internal.languageOb = UtilsLang().getLang(lang).right_sidebar;

        let replacements = {
            typeRegionTranslate: Internal.languageOb.region_types[typeRegion],
            textRegionTranslate: textRegion,
        };

        const chartResult = [
            {
                "id": "pastureRankings",
                "idsOfQueriesExecuted": [
                    { idOfQuery: 'estados', labelOfQuery: Internal.languageOb["area3_card"]["pastureRankingStates"].labelOfQuery['estados'] },
                ],
                "title": Internal.languageOb["area3_card"]["pastureRankingStates"].title,
                "getText": function (chart) {

                    const text = Internal.replacementStrings(Internal.languageOb["area3_card"]["pastureRankingStates"].text, replacements)
                    return text
                },
                "type": 'bar',
                "options": {
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            labels: {
                                color: '#495057'
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: '#495057'
                            },
                            grid: {
                                color: '#ebedef'
                            }
                        },
                        y: {
                            ticks: {
                                color: '#495057'
                            },
                            grid: {
                                color: '#ebedef'
                            }
                        }
                    }
                }
            },
        ]

        let chartFinal = []

        for (let chart of chartResult) {
            chart['data'] = Internal.buildGraphResult(request.queryResult, chart)

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
        response.end()

    };

    Controller.handleTableRankings = function (request, response) {
        const { lang, typeRegion, valueRegion, textRegion } = request.query;
        const language = lang;

        Internal.languageOb = UtilsLang().getLang(language).right_sidebar;

        let replacements = {
            typeRegionTranslate: Internal.languageOb.region_types[typeRegion],
            textRegionTranslate: textRegion,
        };

        const tablesDescriptor = [
            {
                "id": "pastureRankingsCities",
                "idsOfQueriesExecuted": [
                    { idOfQuery: 'municipios', labelOfQuery: Internal.languageOb["area_table_card"]["pastureRankingsCities"].labelOfQuery['municipios'] },
                ],
                "title": Internal.languageOb["area_table_card"]["pastureRankingsCities"].title,
                "columnsTitle": Internal.languageOb["area_table_card"]["pastureRankingsCities"].columnsTitle,
                "getText": function (chart) {
                    const text = Internal.replacementStrings(Internal.languageOb["area_table_card"]["pastureRankingsCities"].text, replacements)
                    return text
                },
                "rows_labels": "index?city?uf?value",
            },
            {
                "id": "pastureRankingsStates",
                "idsOfQueriesExecuted": [
                    { idOfQuery: 'estados', labelOfQuery: Internal.languageOb["area_table_card"]["pastureRankingsStates"].labelOfQuery['estados'] },
                ],
                "title": Internal.languageOb["area_table_card"]["pastureRankingsStates"].title,
                "columnsTitle": Internal.languageOb["area_table_card"]["pastureRankingsStates"].columnsTitle,
                "getText": function (chart) {
                    const text = Internal.replacementStrings(Internal.languageOb["area_table_card"]["pastureRankingsStates"].text, replacements)
                    return text
                },
                "rows_labels": "index?uf?value",
            },
            {
                "id": "pastureRankingsBiomes",
                "idsOfQueriesExecuted": [
                    { idOfQuery: 'biomas', labelOfQuery: Internal.languageOb["area_table_card"]["pastureRankingsBiomes"].labelOfQuery['biomas'] },
                ],
                "title": Internal.languageOb["area_table_card"]["pastureRankingsBiomes"].title,
                "columnsTitle": Internal.languageOb["area_table_card"]["pastureRankingsBiomes"].columnsTitle,
                "getText": function (chart) {
                    const text = Internal.replacementStrings(Internal.languageOb["area_table_card"]["pastureRankingsBiomes"].text, replacements)
                    return text
                },
                "rows_labels": "index?biome?value",
            }
        ]


        let resultFinal = []
        for (let res of tablesDescriptor) {

            res['data'] = Internal.buildTableData(request.queryResult, res)
            res['show'] = false

            if (res['data']) {
                res['show'] = true
                res['text'] = res.getText(request.queryResult, res.idsOfQueriesExecuted)
            } else {
                res['data'] = {};
                res['show'] = false;
                res['text'] = "erro."
            }

            resultFinal.push(res);
        }

        response.send(resultFinal)
        response.end()
    };

    return Controller;
}
