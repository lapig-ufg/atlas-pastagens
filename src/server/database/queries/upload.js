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


    Query.pasture = function (params) {

        var token = params['token']
        var year = params['year']
        return [{
            source: 'lapig',
            id: 'pastagem',
            sql: "SELECT p.year, SUM((ST_Area(safe_intersection(st_transform(p.geom,4674), up.geom)::GEOGRAPHY) / 1000000.0)*100.0) as area_pastagem " +
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

    Query.pasturequality = function (params) {

        var token = params['token']
        var year = params['year']
        return [{
            source: 'lapig',
            id: 'pasture_quality',
            sql: "SELECT p.year, b.name as classe, b.color, SUM((ST_Area(safe_intersection(st_transform(p.geom,4674), up.geom)::GEOGRAPHY) / 1000000.0)*100.0) AS area_pastagem "
                + " FROM pasture_quality_col6 p "
                + " INNER JOIN graphic_colors as b on cast(p.classe as varchar) = b.class_number AND b.table_rel = 'pasture_quality' "
                + " INNER JOIN fdw_general.upload_shapes up on ST_INTERSECTS(ST_TRANSFORM(p.geom,4674), up.geom)  where p.year IS NOT NULL "
                + (year ? "AND year = ${year}" : "")
                + " AND up.token= ${token} GROUP BY 1,2,3 order by 1 desc ",
            mantain: true
        }
        ]
    };

    Query.carbonstock = function (params) {

        var token = params['token']
        var year = params['year']
        return [{
            source: 'lapig',
            id: 'pastagem',
            sql: "SELECT p.year, SUM((ST_Area(safe_intersection(st_transform(p.geom,4674), up.geom)::GEOGRAPHY) / 1000000.0)*100.0) as area_pastagem " +
                "FROM pasture_col6 p INNER JOIN fdw_general.upload_shapes up on ST_INTERSECTS(ST_TRANSFORM(p.geom,4674), up.geom) where p.year IS NOT NULL  " +
                (year ? "AND year = ${year}" : "") +
                "and up.token= ${token} GROUP BY 1 order by 1 desc",
            mantain: true
        }
        ]
    };

    Query.getpastureyears = function (params) {

        return [{
            source: 'lapig',
            id: 'pasture',
            sql: "select distinct year from pasture_col6 pc order by year asc",
            mantain: true
        },
        {
            source: 'lapig',
            id: 'pasture_quality',
            sql: "select distinct year from pasture_quality_col6 pc order by year asc",
            mantain: true
        }
        ]
    }



    return Query;

};