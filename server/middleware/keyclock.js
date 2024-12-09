const axios = require("axios");
const qs = require("qs");

module.exports = function (app) {
  var payload = {
    client_id: process.env.AUTH_ID,
    client_secret: process.env.AUTH_SECRET,
    grant_type: "client_credentials",
  };

  var api = `${process.env.AUTH_URL}/realms/${process.env.AUTH_REALM}/protocol/openid-connect/token`;

  return function (request, response, next) {
    axios({
      method: "post",
      url: api,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify(payload),
    }).then((auth) => {
        if (auth.status == 200) {
          request.auth_token = auth.data;

          next();
        } else {
          response.status(401).send({ message: "You are not allowed here." });
        }
      })
      .catch((error) => {
        response.status(501).send({ message: error });
      });
  };
};
