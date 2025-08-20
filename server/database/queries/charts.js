module.exports = function (app) {
    var Internal = {}
    var Query = {};

    Query.defaultParams = {}

    Internal.getRegionFilter = function (type, key) {
        var keyLowerCase = String(key).toLocaleLowerCase();

        switch (type) {
            case 'country':
                return "true";
            case 'city':
                return `cd_geocmu='${keyLowerCase}'`;
            case 'state':
                return `uf='${keyLowerCase}'`;
            case 'region':
                return `lower(regiao)='${keyLowerCase}'`;
            case 'biome':
                return `lower(bioma) = '${keyLowerCase}'`;
            case 'fronteira':
                if (keyLowerCase === 'amz_legal') {
                    return "amaz_legal = 1";
                } else if (keyLowerCase === 'matopiba') {
                    return "matopiba = 1";
                } else if (keyLowerCase === 'arcodesmat') {
                    return "arcodesmat = 1";
                }
                break;
            default:
                break;
        }
    }

    Internal.getYearFilter = function (year) {
        if (year) year = "year = " + (year);
        
        return year;
    }

    Query.resumo = function (params) {
        var regionFilter = Internal.getRegionFilter(params['typeRegion'], params['valueRegion']);
        var yearFilter = params['year'] ? Internal.getYearFilter(params['year']) : Internal.getYearFilter(2020);

        return [
            {
                source: 'lapig',
                id: 'region',
                sql: `SELECT CAST(SUM(pol_ha) as double precision) as area_region 
                        FROM new_regions WHERE ${regionFilter}`
            },
            {
                source: 'lapig',
                id: 'pasture_carbon_somsc',
                sql: `SELECT min(c.value_min),avg(value_mean) as mean, (avg(value_mean) *
                        (SELECT  sum(area_ha) FROM pasture_col9 WHERE ${regionFilter} AND ${yearFilter})) as total
                        FROM pasture_carbon_somsc_statistic_2022 c
                        WHERE ${regionFilter} AND ${yearFilter}`,
                mantain: true
            },
            {
                source: 'lapig',
                id: 'pasture_carbon_somsc_mean',
                sql: `SELECT avg(value_mean) as value
                        FROM pasture_carbon_somsc_statistic_2022
                        WHERE  ${regionFilter}
                        AND ${yearFilter}`,
                mantain: true
            }
        ]
    }

    Query.pastureGraph = function (params) {
        var regionFilter = Internal.getRegionFilter(params['typeRegion'], params['valueRegion']);

        return [
            {
                source: 'lapig',
                id: 'pasture_carbon',
                sql: `SELECT a.year::int as label, b.color, b.name as classe, sum(value_sum) as value
                    FROM pasture_carbon_somsc_statistic_2022 a INNER JOIN graphic_colors as b on b.table_rel = 'pasture_carbon'
                    WHERE ${regionFilter} GROUP BY 1,2,3 ORDER BY 1 ASC;`,
            }
        ]
    }

    return Query;
}
