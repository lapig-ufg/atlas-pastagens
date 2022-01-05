module.exports = function (app) {
    var Controller = {}
    var Internal = {}

    Controller.largest = function (request, response) {

        var rows = request.queryResult['largest_cities'];


        var rows2 = request.queryResult['teste'];

        response.send({ db1: rows, db2: rows2 });
        response.end();

    }

    return Controller;

}