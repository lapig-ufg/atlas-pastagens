module.exports = function(app) {
    var Query = {};

    Query.defaultParams = {}

    Query.create = function(params) {

        const { name, email, subject, institution, message } = params['contact'];

        return [{
                source: 'lapig',
                id: 'create',
                sql: `INSERT INTO public.contato_atlas ("name", email, subject, message, institution, status) VALUES('${name}', '${email}', '${subject}', '${message}', '${institution}', 'RECEIVED');`,
                mantain: true
            }
        ]
    }

    return Query;
z
}