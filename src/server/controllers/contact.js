module.exports = function (app) {
    var Controller = {}
    var Internal = {}

    Controller.create = function (request, response) {
        // var rows = request.queryResult['create'];

        response.status(201).send({ message: "sucess" });
        response.end();

    }

    return Controller;

}