const axios = require('axios')

module.exports = function (app) {
    var Internal = {}

    var api = 'https://www.google.com/recaptcha/api/siteverify';

    return function (request, response, next) {
        console.log('oi')
        axios({
            method: 'post',
            url: api,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            data: `secret=${process.env.RECAPTCHA_KEY}&response=${request.body.contact.token}`,
        }).then(recaptcha => {
            if(recaptcha.data.success) {
                next();
            } else {
                response.status(401)
                .send({ message: "You are a robot" })
            }
        }).catch(error => {
            response.status(501)
                .send({ message: "Sever error" })
        });
    }
}