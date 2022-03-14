module.exports = function (app) {

    var Internal = {}
    var Query = {};

    Query.areainfo = function (params) {

        return [
            {
                source: 'general',
                id: 'regions_pershape',
                sql: "select s.text, s.type, s.value, s.uf from regions_geom s INNER JOIN upload_shapes up on ST_Intersects(up.geom, s.geom) where s.type not in ('fronteira', 'biome') AND up.token= ${token} order by 1 asc",
                mantain: true
            },
            {
                source: 'general',
                id: 'area_upload',
                sql: "select token, SUM((ST_AREA(geom::GEOGRAPHY) / 1000000.0)*100.0) as area_upload from upload_shapes where token= ${token} group by 1",
                mantain: true
            },
            {
                source: 'general',
                id: 'geojson_upload',
                sql: "select  ST_ASGEOJSON(ST_Transform(ST_Multi(ST_Union(geom)), 4674)) as geojson from upload_shapes where token= ${token} ",
                mantain: true
            }
        ]
    }


    Query.findgeojsonbytoken = function (params) {
        return [{
            source: 'general',
            id: 'area_upload',
            sql: "select token, SUM((ST_AREA(geom::GEOGRAPHY) / 1000000.0)*100.0) as area_upload from upload_shapes where token= ${token} group by 1",
            mantain: true
        },
        {
            source: 'general',
            id: 'geojson_upload',
            sql: "select ST_ASGEOJSON(ST_Transform(ST_Multi(ST_Union(geom)), 4674)) as geojson from upload_shapes where token= ${token}",
            mantain: true
        }

        ]
    }

    Query.getanalysis = function (params) {

        return [{
            source: 'general',
            id: 'return_analysis',
            sql: "SELECT gid, token, analysis, TO_CHAR(date,'DD/MM/YYYY HH:mm:ss') as data FROM area_analysis WHERE token = ${token};",
            mantain: true
        }
        ]
    }

    Query.saveanalysis = function (params) {
        params['analysis'] = Buffer.from(JSON.stringify(params['analysis'])).toString('base64');

        return [{
            source: 'general',
            id: 'store',
            sql: "INSERT INTO area_analysis(token, analysis, date) VALUES ('" + params['token'] + "', '" + params['analysis'] + "', NOW()) RETURNING token;",
            mantain: true
        }
        ]
    };

    /**Other methods to copy later */


    Query.queimadas = function (params) {

        var token = params['token']
        return [{
            source: 'lapig',
            id: 'queimadas',
            sql: "SELECT p.year, SUM((ST_AREA(ST_Intersection(ST_MAKEVALID(p.geom),up.geom)::GEOGRAPHY) / 1000000.0)*100.0) as area_queimada FROM bi_ce_queimadas_250_lapig p " +
                " INNER JOIN upload_shapes up on ST_INTERSECTS(p.geom, up.geom) where p.year IS NOT NULL and up.token= ${token} GROUP BY 1 order by 1 desc",
            mantain: true
        }
        ]
    }

    Query.pastagem = function (params) {

        var token = params['token']
        var year = params['year']
        return [{
            source: 'lapig',
            id: 'pastagem',
            sql: "SELECT p.year, SUM((ST_AREA(ST_Intersection(st_multi(st_collectionextract(ST_MAKEVALID(ST_TRANSFORM(p.geom,4674)),3)),up.geom)::GEOGRAPHY) / 1000000.0)*100.0) as area_pastagem " +
                "FROM pasture_col6 p INNER JOIN fdw_general.upload_shapes up on ST_INTERSECTS(ST_TRANSFORM(p.geom,4674), up.geom) where p.year IS NOT NULL  " +
                (year ? "AND year = ${year}" : "") +
                "and up.token= ${token} GROUP BY 1 order by 1 desc",
            mantain: true
        }
        ]
        // SELECT up.token,
        // 		p.year,
        //        p.intersect_area
        // FROM fdw_general.upload_shapes up
        // CROSS JOIN LATERAL (
        //   SELECT pas.year,
        //          SUM((ST_Area(safe_intersection(st_transform(pas.geom,4674), up.geom)::GEOGRAPHY) / 1000000.0)*100.0) AS intersect_area
        //   FROM   pasture_col6 pas
        //   WHERE  up.token= '1642272820293' and pas.year = 2020 and ST_Intersects(st_transform(pas.geom,4674), up.geom)
        //   group by 1
        //   ORDER BY
        //          2 DESC
        // ) AS p
        // ;
    }

    Query.prodes = function (params) {
        var token = params['token']
        return [{
            source: 'lapig',
            id: 'prodes',
            sql: "SELECT p.year, SUM((ST_AREA(ST_Intersection(p.geom,up.geom)::GEOGRAPHY) / 1000000.0)*100.0) as area_desmat FROM desmatamento_prodes p INNER JOIN upload_shapes up on ST_INTERSECTS(p.geom, up.geom) where p.year IS NOT NULL and up.token= ${token} GROUP BY 1 order by 1 desc",
            mantain: true,
        }

        ]
    }

    Query.terraclass = function (params) {

        var token = params['token']
        return [{
            source: 'lapig',
            id: 'terraclass',
            sql: "SELECT b.name as lulc, b.color as color, SUM((ST_AREA(safe_intersection(ST_MAKEVALID(p.geom),up.geom)::GEOGRAPHY) / 1000000.0)*100.0) as area_lulc FROM uso_solo_terraclass p INNER JOIN graphic_colors b on unaccent(b.name) ilike unaccent(p.classe) AND b.table_rel = 'uso_solo_terraclass' " +
                " INNER JOIN upload_shapes up on ST_INTERSECTS(p.geom, up.geom) " +
                " where up.token= ${token}" +
                " GROUP BY 1,2 ORDER BY 3 DESC",
            mantain: true
        }
        ]
    }

    Query.mapbiomas = function (params) {

        var token = params['token']
        return [{
            source: 'lapig',
            id: 'mapbiomas',
            sql: "SELECT b.name as lulc, b.color as color, SUM((ST_AREA(safe_intersection(st_multi(st_collectionextract(ST_MAKEVALID(ST_TRANSFORM(p.wkb_geometry,4674)),3)),up.geom)::GEOGRAPHY) / 1000000.0)*100.0) as area_lulc FROM uso_solo_mapbiomas p INNER JOIN graphic_colors b on unaccent(b.name) ilike unaccent(p.classe) AND b.table_rel = 'uso_solo_mapbiomas' " +
                " INNER JOIN upload_shapes up on ST_INTERSECTS(ST_TRANSFORM(p.wkb_geometry,4674), up.geom) " +
                " where p.year = 2018 and up.token= ${token} " +
                " GROUP BY 1,2 ORDER BY 3 DESC",
            mantain: true
        }
        ]
    }


    return Query;

};