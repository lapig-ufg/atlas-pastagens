const https = require('https');

module.exports = function(app) {
    let Controller = {}

    Controller.get = function(request, response) {
        const { url } = request.body;
        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                response.status(200).json({ data: data });
                response.end();
            });

        }).on("error", (err) => {
            response.status(400).json({ message: err.message });
            response.end();
        });
    }

    return Controller;

}