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
        if (year) {
            year = "year = " + (year)
        }
        
        return year;
    }

    Query.resumo = function (params) {
        var regionFilter = Internal.getRegionFilter(params['typeRegion'], params['valueRegion']);
        var yearFilter = params['year'] ? Internal.getYearFilter(params['year']) : Internal.getYearFilter(2020);

        return [
            {
                source: 'lapig',
                id: 'region',
                sql: "SELECT CAST(SUM(pol_ha) as double precision) as area_region FROM new_regions WHERE " + regionFilter + ""
            },
            {
                source: 'lapig',
                id: 'pasture',
                sql: " SELECT  CAST(sum(a.st_area_ha) as double precision) as value "
                    + " FROM pasture_col9 a "
                    + " WHERE " + regionFilter
                    + " AND " + yearFilter,
                mantain: true
            },
            {
                source: 'lapig',
                id: 'pasture_quality',
                sql: " SELECT b.name as classe, b.color, CAST(sum(a.st_area_ha) as double precision) as value "
                    + " FROM pasture_vigor_col9 a " + "INNER JOIN graphic_colors as b on cast(a.classe as varchar) = b.class_number AND b.table_rel = 'pasture_quality'"
                    + " WHERE " + regionFilter
                    + " AND " + yearFilter
                    + " GROUP BY 1,2;",
                mantain: true
            },
            {
                source: 'lapig',
                id: 'pasture_carbon_somsc',
                sql: `select 
                    min(c.value_min),
                    avg(value_mean) as mean, 
                    (avg(value_mean) * (
                    SELECT  sum(area_ha)  
                        FROM pasture_col9 
                        WHERE ${regionFilter}
                        AND ${yearFilter})
                        ) as total
                from pasture_carbon_somsc_statistic_2022 c
                WHERE ${regionFilter}
                AND ${yearFilter}`,
                mantain: true
            },
            {
                source: 'lapig',
                id: 'pasture_carbon_somsc_mean',
                sql: `select avg(value_mean) as value
                    from pasture_carbon_somsc_statistic_2022
                    WHERE  ${regionFilter}
                    AND ${yearFilter}`,
                mantain: true
            }
        ]
    }

    Query.pastureGraph = function (params) {
        var regionFilter = Internal.getRegionFilter(params['typeRegion'], params['valueRegion']);

        console.log(regionFilter)

        return [
            {
                source: 'lapig',
                id: 'pasture',
                sql: `SELECT  a.year::int as label, b.color, b.name as classe, sum(a.st_area_ha) as value, 
                    (SELECT CAST(SUM(pol_ha) as double precision) FROM new_regions WHERE ${regionFilter}) as area_mun 
                    FROM pasture_col9 a INNER JOIN graphic_colors b on b.table_rel = 'pasture' 
                    WHERE ${regionFilter} 
                    GROUP BY 1,2,3 ORDER BY 1 ASC;`,
                mantain: true
            },
            {
                source: 'lapig',
                id: 'lotacao_bovina_regions',
                sql: `SELECT  a.year::int as label, b.color, b.name as classe, sum(a.ua) as value,
                    (SELECT CAST(SUM(pol_ha) as double precision) FROM regions WHERE ${regionFilter}) as area_mun
                    FROM lotacao_bovina_regions a INNER JOIN graphic_colors as b on b.table_rel = 'rebanho_bovino'
                    WHERE ${regionFilter}
                    GROUP BY 1,2,3 ORDER BY 1 ASC;`,
                mantain: true
            },
            {
                source: 'lapig',
                id: 'pasture_quality',
                sql: `SELECT a.year::int as label,b.color, b.name as classe, sum(a.st_area_ha) as value,
                    (SELECT CAST(SUM(pol_ha) / 1000 as double precision) FROM regions WHERE ${regionFilter}) as area_mun
                    FROM pasture_vigor_col9 a INNER JOIN graphic_colors as b on cast(a.classe as varchar) = b.class_number AND b.table_rel = 'pasture_quality'
                    WHERE ${regionFilter} 
                    GROUP BY 1,2,3 ORDER BY 1 ASC;`,
                mantain: true
            },
            {
                source: 'lapig',
                id: 'pasture_carbon',
                sql: `SELECT a.year::int as label, b.color, b.name as classe, sum(value_sum) as value
                    FROM pasture_carbon_somsc_statistic_2022 a INNER JOIN graphic_colors as b on b.table_rel = 'pasture_carbon'
                    WHERE ${regionFilter} GROUP BY 1,2,3 ORDER BY 1 ASC;`,
            }
        ]
    }

    Query.area2 = function (params) {

        var regionFilter = Internal.getRegionFilter(params['typeRegion'], params['valueRegion']);
        var yearFilter = params['year'] ? Internal.getYearFilter(params['year']) : Internal.getYearFilter(2020);

        return [
            {
                source: 'lapig',
                id: 'pasture_quality',
                sql: "SELECT b.name as label, b.color, sum(a.st_area_ha) as value, "
                    + "(SELECT CAST(SUM(pol_ha) as double precision) FROM regions WHERE " + regionFilter + ") as area_mun "
                    + "FROM pasture_vigor_col9 as A "
                    + "INNER JOIN graphic_colors as B on cast(a.classe as varchar) = b.class_number AND b.table_rel = 'pasture_quality' "
                    + "WHERE " + regionFilter
                    + " AND " + yearFilter
                    + " GROUP BY 1,2 ORDER BY 3 DESC",
                mantain: true
            },
        ];
    }

    Query.area3 = function (params) {
        var regionFilter = Internal.getRegionFilter(params['typeRegion'], params['valueRegion']);
        var yearFilter = params['year'] ? Internal.getYearFilter(params['year']) : Internal.getYearFilter(2020);

        return [
            {
                source: 'lapig',
                id: 'estados',
                sql: " SELECT UPPER(uf) AS label, '#d4a31c' as color,  SUM(area_ha) as value  FROM pasture_col9 "
                    + "WHERE " + regionFilter
                    + " AND " + yearFilter
                    + " GROUP BY 1, 2 ORDER BY 3 DESC;",
                mantain: true
            }
        ]
    }

    Query.areatable = function (params) {
        var regionFilter = Internal.getRegionFilter(params['typeRegion'], params['valueRegion']);
        var yearFilter = params['year'] ? Internal.getYearFilter(params['year']) : Internal.getYearFilter(2020);

        return [
            {
                source: 'lapig',
                id: 'municipios',
                sql: "SELECT p.municipio as city, p.cd_geocmu as cityCode, UPPER(p.uf) as uf, SUM(p.st_area_ha) as value  FROM pasture_col9 p "
                    + " WHERE " + regionFilter
                    + " AND " + yearFilter
                    + " GROUP BY 1, 2, 3 ORDER BY value DESC;",
                mantain: true
            },
            {
                source: 'lapig',
                id: 'estados',
                sql: " SELECT UPPER(p.uf) AS uf, SUM(p.st_area_ha) as value  FROM pasture_col9 p "
                    + "WHERE " + regionFilter
                    + " AND " + yearFilter
                    + " GROUP BY 1  ORDER BY 2 DESC;",
                mantain: true
            },
            {
                source: 'lapig',
                id: 'biomas',
                sql: " SELECT p.bioma AS biome,  SUM(p.st_area_ha) as value  FROM pasture_col9 p "
                    + "WHERE " + regionFilter
                    + " AND " + yearFilter
                    + " GROUP BY 1 ORDER BY 2 DESC;",
                mantain: true
            }
        ]
    }

    return Query;
}
