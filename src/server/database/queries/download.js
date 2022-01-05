module.exports = function(app) {

    var Internal = {}
    var Query = {};

    Query.csv = function(params) {

        let layer = params.layer;
        let region = params.selectedRegion;
        let time = params.times;

        let mapper = {
            "bi_ce_prodes_desmatamento_100_fip": "select gid,view_date, cd_geocmu, uf, sucept_desmat, bfm_pct, year, classefip, areamunkm from prodes_cerrado where " + time.value,
            "bi_ce_deter_desmatamento_100_fip": "select gid,view_date, cd_geocmu, uf, sucept_desmat, bfm_pct, date_part('year', deter_cerrado.view_date) AS year, classefip, areamunkm from deter_cerrado where " + time.value,
            "bi_ce_prodes_antropico_100_fip": "select gid,view_date, cd_geocmu, uf, sucept_desmat, bfm_pct, year, classefip, areamunkm from prodes_cerrado where " + time.value,
            "bi_ce_prodes_desmatamento_pontos_campo_fip": "select p.gid as progid, p.county as procounty, p.uf, p.cd_geocmu, p.view_date as pview_date, p.areamunkm as pareamunkm, p.sucept_desmat as psucept_desmat, pc.gid pontogid, pc.campo as pontocampo from prodes_cerrado p inner join pontos_campo pc on pc.prodes_id = p.gid where 1=1",
            "bi_ce_prodes_desmatamento_abc_fip": "select p.gid, p.county, p.uf, p.view_date, p.sucept_desmat, p.areamunkm, abc.* from prodes_fip_abc abc inner join prodes_cerrado p on abc.prodes_id = p.gid where 1=1",
            "bi_ce_deter_desmatamento_pontos_campo_fip": "select p.gid as progid, p.county as procounty, p.uf, p.cd_geocmu, p.view_date as pview_date, p.areamunkm as pareamunkm, p.sucept_desmat as psucept_desmat from deter_cerrado p inner join pontos_campo pc on pc.deter_id = p.gid"
        }

        let sqlQuery = mapper[layer.selectedType];

        if (region.type == 'city') {
            sqlQuery += " AND cd_geocmu='" + region.cd_geocmu + "'";
        } else if (region.type == 'state') {
            sqlQuery += " AND uf='" + region.value + "'";
        }

        // sqlQuery += " GROUP BY 1,2,3,4,5,6,7,8"

        return [

            {
                id: 'csv',
                sql: sqlQuery
            },
            {
                id: 'next',
                sql: "select true"
            }
        ]
    }

    return Query;

};