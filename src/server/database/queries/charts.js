module.exports = function (app) {

    var Internal = {}
    var Query = {};

    Query.defaultParams = {}

    Internal.getRegionFilter = function (type, key) {

        var regionsFilter;

        if (type == 'country') {
            regionsFilter = "1=1";
        } else {
            var regionsFilter = "";
            if (type == 'city')
                regionsFilter += "cd_geocmu = '" + key + "'"
            else if (type == 'state')
                regionsFilter += "uf = '" + key + "'"
            else if (type == 'biome')
                regionsFilter += "bioma = '" + key.toUpperCase() + "'"
            else if (type == 'fronteira') {
                if (key == 'amz_legal') {
                    regionsFilter += "amaz_legal = 1"
                }
                else if (key.toLowerCase() == 'MATOPIBA'.toLowerCase()) {
                    regionsFilter += "matopiba = 1"
                }
                else if (key.toLowerCase() == 'ARCODESMAT'.toLowerCase()) {
                    regionsFilter += "arcodesmat = 1"
                }
            }
        }

        return regionsFilter
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
                    + " FROM pasture_col6 a "
                    + " WHERE " + regionFilter
                    + " AND " + yearFilter,
                mantain: true
            },
            {
                source: 'lapig',
                id: 'pasture_quality',
                sql: " SELECT b.name as classe, b.color, CAST(sum(a.area_ha) as double precision) as value "
                    + " FROM pasture_quality_col6 a " + "INNER JOIN graphic_colors as b on cast(a.classe as varchar) = b.class_number AND b.table_rel = 'pasture_quality'"
                    + " WHERE " + regionFilter
                    + " AND " + yearFilter
                    + " GROUP BY 1,2;",
                mantain: true
            },
        ]
    }

    Query.area1 = function (params) {

        var regionFilter = Internal.getRegionFilter(params['typeRegion'], params['valueRegion']);
        // var yearFilter = Internal.getYearFilter(params['year']);

        return [
            //     {
            //     source: 'lapig',
            //     id: 'prodes',
            //     // sql: " SELECT a.year as label, b.color, CAST(SUM(pol_ha) / 1000 as double precision) as value, (SELECT CAST(SUM(pol_ha) / 1000 as double precision) FROM regions " + regionFilter + ") as area_mun " +
            //     //     " FROM desmatamento_prodes a " +
            //     //     "INNER JOIN graphic_colors as B on 'prodes_cerrado' = b.name AND b.table_rel = 'desmatamento_prodes' " + regionFilter +
            //     //     // " AND " + yearFilter +
            //     //     " GROUP BY 1,2;",
            //     sql: " SELECT year as label, 'prodes_cerrado' source, CAST(SUM(pol_ha) / 1000 as double precision) as value, (SELECT CAST(SUM(pol_ha) / 1000 as double precision) FROM regions " + regionFilter + ") as area_mun " +
            //         " FROM desmatamento_prodes " +
            //         regionFilter +
            //         // " AND " + yearFilter +
            //         " GROUP BY 1;",
            //     mantain: true
            // },
            {
                source: 'lapig',
                id: 'pasture',
                sql: " SELECT  a.year as label, b.color, b.name as classe, sum(a.st_area_ha) as value, "
                    + "(SELECT CAST(SUM(pol_ha) as double precision) FROM new_regions WHERE " + regionFilter + ") as area_mun "
                    + " FROM pasture_col6 a " + "INNER JOIN graphic_colors b on b.table_rel = 'pasture' "
                    + " WHERE " + regionFilter
                    // " AND " + yearFilter +
                    + " GROUP BY 1,2,3 ORDER BY 1 ASC;",
                mantain: true
            },
            {
                source: 'lapig',
                id: 'lotacao_bovina_regions',
                sql: " SELECT  a.year as label, b.color, b.name as classe, sum(a.ua) as value,  (SELECT CAST(SUM(pol_ha) as double precision) FROM regions WHERE " + regionFilter + ") as area_mun " +
                    " FROM lotacao_bovina_regions a " + "INNER JOIN graphic_colors as b on b.table_rel = 'rebanho_bovino' " +
                    "WHERE " + regionFilter +
                    // " AND " + yearFilter +
                    " GROUP BY 1,2,3 ORDER BY 1 ASC;",
                mantain: true
            },
            {
                source: 'lapig',
                id: 'pasture_quality',
                sql: " SELECT a.year as label,b.color, b.name as classe, sum(a.area_ha) as value, (SELECT CAST(SUM(pol_ha) / 1000 as double precision) FROM regions WHERE " + regionFilter + ") as area_mun " +
                    " FROM pasture_quality_col6 a " + "INNER JOIN graphic_colors as b on cast(a.classe as varchar) = b.class_number AND b.table_rel = 'pasture_quality'" +
                    "WHERE " + regionFilter +
                    // " AND " + yearFilter +
                    " GROUP BY 1,2,3 ORDER BY 1 ASC;",
                mantain: true
            },
        ]

    }

    Query.area2 = function (params) {

        var regionFilter = Internal.getRegionFilter(params['typeRegion'], params['valueRegion']);
        var yearFilter = params['year'] ? Internal.getYearFilter(params['year']) : Internal.getYearFilter(2020);

        return [
            // {
            //     source: 'lapig',
            //     id: 'uso_solo_terraclass',
            //     sql: "SELECT a.classe as label, b.color, sum(a.area_ha) as value, (SELECT CAST(SUM(pol_ha) as double precision) FROM regions " + regionFilter + ") as area_mun FROM uso_solo_terraclass as A INNER JOIN graphic_colors as B on a.classe = b.name AND b.table_rel = 'uso_solo_terraclass' " + regionFilter + " GROUP BY 1,2 ORDER BY 3 DESC",
            //     mantain: true
            // },
            // {
            //     source: 'lapig',
            //     id: 'uso_solo_probio',
            //     sql: "SELECT a.classe as label, b.color, sum(a.area_ha) as value, (SELECT CAST(SUM(pol_ha) as double precision) FROM regions " + regionFilter + ") as area_mun FROM uso_solo_probio as A INNER JOIN graphic_colors as B on a.classe = b.name AND b.table_rel = 'uso_solo_probio' " + regionFilter + " GROUP BY 1,2 ORDER BY 3 DESC",
            //     mantain: true
            // },
            // {
            //     id: 'uso_solo_mapbiomas',
            //     sql: "SELECT b.name as label, b.color, sum(a.area_ha) as value, (SELECT SUM(pol_ha) FROM regions " + tableRegionsFilter + ") as area_mun, year FROM uso_solo_mapbiomas as A INNER JOIN graphic_colors as B on a.classe = b.class_number AND b.table_rel = 'uso_solo_mapbiomas' " + regionsFilter + " " + year + " GROUP BY 1,2,5 ORDER BY 3 DESC",
            //     mantain: true
            // }
            {
                source: 'lapig',
                id: 'pasture_quality',
                sql: "SELECT b.name as label, b.color, sum(a.area_ha) as value, "
                    + "(SELECT CAST(SUM(pol_ha) as double precision) FROM regions WHERE " + regionFilter + ") as area_mun "
                    + "FROM pasture_quality_col6 as A "
                    + "INNER JOIN graphic_colors as B on cast(a.classe as varchar) = b.class_number AND b.table_rel = 'pasture_quality' "
                    + "WHERE " + regionFilter
                    + " AND " + yearFilter
                    + " GROUP BY 1,2 ORDER BY 3 DESC",
                mantain: true
            },
            // {
            //     source: 'lapig',
            //     id: 'biomassa',
            //     sql: "SELECT a.classe as label, b.color, sum(a.area_ha) as value, (SELECT CAST(SUM(pol_ha) as double precision) FROM regions " + regionFilter + ") as area_mun FROM uso_solo_terraclass as A INNER JOIN graphic_colors as B on a.classe = b.name AND b.table_rel = 'uso_solo_terraclass' " + regionFilter + " GROUP BY 1,2 ORDER BY 3 DESC",
            //     mantain: true
            // },

        ];
    }

    Query.area3 = function (params) {

        var regionFilter = Internal.getRegionFilter(params['typeRegion'], params['valueRegion']);
        var yearFilter = params['year'] ? Internal.getYearFilter(params['year']) : Internal.getYearFilter(2020);
        // var amount = params['amount'] ? params['amount'] : 10
        return [
            {
                source: 'lapig',
                id: 'estados',
                sql: " SELECT UPPER(uf) AS label, '#d4a31c' as color,  SUM(area_ha) as value  FROM pasture_col6 "
                    + "WHERE " + regionFilter
                    + " AND " + yearFilter
                    + " GROUP BY 1, 2 ORDER BY 3 DESC;",
                // + " LIMIT " + Number(amount) + ";",
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
                sql: "SELECT p.municipio as city, UPPER(p.uf) as uf, SUM(p.st_area_ha) as value FROM pasture_col6 p "
                    + " WHERE " + regionFilter
                    + " AND " + yearFilter
                    + " GROUP BY 1, 2 ORDER BY 3 DESC;",
                // + " LIMIT " + Number(amount) + ";",
                mantain: true
            },
            {
                source: 'lapig',
                id: 'estados',
                sql: " SELECT UPPER(p.uf) AS uf, SUM(p.st_area_ha) as value  FROM pasture_col6 p "
                    + "WHERE " + regionFilter
                    + " AND " + yearFilter
                    + " GROUP BY 1  ORDER BY 2 DESC;",
                // + " LIMIT " + Number(amount) + ";",
                mantain: true
            },
            {
                source: 'lapig',
                id: 'biomas',
                sql: " SELECT p.bioma AS biome,  SUM(p.st_area_ha) as value  FROM pasture_col6 p "
                    + "WHERE " + regionFilter
                    + " AND " + yearFilter
                    + " GROUP BY 1 ORDER BY 2 DESC;",
                // + " LIMIT " + Number(amount) + ";",
                mantain: true
            }
        ]
    }


    return Query;

}