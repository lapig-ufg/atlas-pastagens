module.exports = function(app) {

    var Internal = {}
    var Query = {};

    Query.defaultParams = {}

    Query.largest = function(params) {

        var amount = params['amount'];
        var msfilter = params['msfilter']

        var condition = '';
        if (msfilter) {
            condition = ' WHERE ' + msfilter;
        }

        return [{
                source: 'lapig',
                id: 'largest_cities',
                sql: "SELECT bioma, municipio,estado,cd_geocmu, uf, mun_ha FROM regions " + condition + " ORDER BY mun_ha DESC LIMIT ${amount}",
                mantain: true
            },
            {
                source: 'general',
                id: 'teste',
                sql: "SELECT * from regions_geom  LIMIT ${amount}",
                mantain: true
            }
        ]
    }






    return Query;

}