module.exports = function (app) {
    let Query = {};

    Query.defaultParams = {}

    Query.tags = function (params) {
        return [
            {
                source: 'lapig',
                id: 'tags',
                sql: 'select col, tag from galeria_tags where tag is not null',
                mantain: true
            }
        ]
    }

    Query.images = function (params) {
        const filters = params['tags'];
        let condition = 'where ';

        if(Array.isArray(filters)){
            filters.forEach((filter, index) => {
                //if(index === filters.length - 1){
                //    condition += filter.column + " ilike '%" +  filter.tag + "%'";
                //}else{
                //    condition += filter.column + " ilike '%" +  filter.tag + "%' AND ";
                // }
                if(index === filters.length - 1){
                    condition += filter.column + " = '" +  filter.tag + "'";
                }else{
                    condition += filter.column + " = '" +  filter.tag + "' AND ";
                }
            })
        } else {
            condition += "tag_1 = 'Pastagem'";
        }

        return [
            {
                source: 'lapig',
                id: 'images',
                sql: "select *, to_char(data,'DD/MM/YYYY HH24:MI:SS') as data from galeria_atlas " + condition,
                mantain: true
            }
        ]
    }

    return Query;

}