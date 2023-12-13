module.exports = function (app) {
    var Controller = {}

    Controller.create = function (request, response) {
        response.status(201).send({ message: "sucess" });
        response.end();
    }

    return Controller;
}