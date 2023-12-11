module.exports = function(app) {

    const merge = require('merge')
    const async = require('async')

    var queries = app.database.queries
    var client = app.database.client

    var Internal = {}

    Internal.parseParams = function(request, queriesOfController) {
        return merge(queriesOfController.defaultParams, request.params, request.query, request.body);
    }

    Internal.defaultController = function(request, response) {
        var queryResult = request.queryResult
        response.send(queryResult)
        response.end()
    }

    return function(request, response, next) {
        var hasController = (request.route.stack.length > 1)
        var pathParts = request.path.split('/')
        var controller = pathParts[2]
        var method = pathParts[3]


        if (controller in queries && method in queries[controller]) {

            var queriesOfController = queries[controller]

            var params = Internal.parseParams(request, queriesOfController)
            var methodQueries = queriesOfController[method](params)

            if (typeof methodQueries == "string") {
                methodQueries = [{
                    id: method,
                    sql: methodQueries
                }]
            }

            var result = {};

            var onEach = function(query, nextQuery) {
                client.query(query, params, function(queryResult) {
                    result[query.id] = queryResult.rows
                    nextQuery()
                })
            };

            var onComplete = function(err) {
                var keys = Object.keys(result)

                if (keys.length == 1 && !methodQueries[0].mantain) {
                    result = result[keys[0]]
                }
                request.queryResult = result

                if (hasController) {
                    next()
                } else {
                    Internal.defaultController(request, response)
                }
            };


            async.each(methodQueries, onEach, onComplete)



        } else {
            next()
        }

    };
};