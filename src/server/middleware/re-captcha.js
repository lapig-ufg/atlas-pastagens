module.exports = function(app) {
    var Internal = {}

    Internal.validate = function(token) {
        return true;
    }

    return function(request, response, next) {
        console.log(request.body.contact)
        if(Internal.validate()) {
            next();
        } else {
            return response.status(401).send({ message: "Unauthorized" });
        }
    }
}