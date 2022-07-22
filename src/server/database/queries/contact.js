module.exports = function(app) {

    var Internal = {}
    var Query = {};

    Query.defaultParams = {}

    Query.create = function(params) {

        const { name, email, subject, institution, message, status } = params['contact'];
        console.log( name, email, subject, institution, message, status)

        return [{
                source: 'lapig',
                id: 'create',
                sql: `INSERT INTO public.contato_atlas ("name", email, subject, message, institution, status) VALUES('${name}', '${email}', '${subject}', '${institution}', '${message}', '${status}');`,
                mantain: true
            }
        ]
    }






    return Query;

}