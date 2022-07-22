module.exports = function (app) {
    var Controller = {}
    var Internal = {}

    Controller.create = function (request, response) {
        console.log(request.queryResult);

        // var rows = request.queryResult['create'];

        // response.send({ rows });
        response.end();

    }

    return Controller;

}