const { Pool, Client } = require('pg')

module.exports = function(app) {

    var Internal = {}
    var Client = {}

    const config = app.config;
    Internal['pool-lapig'] = new Pool(config['pg_lapig'])

    Internal['pool-general'] = new Pool(config['pg_general'])

    Internal.prepareQuery = function(sqlQuery, params) {
        Object.keys(params).forEach(function(name) {
            if(typeof params[name] === 'string'){
                sqlQuery = sqlQuery.replace("${" + name + "}%", "'" + params[name].toUpperCase() + "%'")
                sqlQuery = sqlQuery.replace("$%{" + name + "}", "'%" + params[name] + "'")
                sqlQuery = sqlQuery.replace("${" + name + "}", "'" + params[name] + "'")
            }
        })
        return sqlQuery
    }

    Client.init = function(callback) {
        Internal['pool-lapig'].connect((err, client, release) => {
            if (err)
                return console.error('Error acquiring client', err.stack)

            Internal['client-lapig'] = client
            Internal['release-lapig'] = release

            callback()

        })
    };

    Client.init_general = function(callback) {

        Internal['pool-general'].connect((err, client, release) => {
            if (err)
                return console.error('Error acquiring client', err.stack)

            Internal['client-general'] = client
            Internal['release-general'] = release

            callback()

        })
    };

    Client.query = function(queryObj, params, callback) {
        const start = Date.now()

        if (callback === undefined) {
            callback = params
            params = {}
        }

        query = Internal.prepareQuery(queryObj.sql, params)

        if (queryObj.source == 'lapig') {

            return Internal['pool-lapig'].query(query, (err, result) => {

                if (err !== null){
                    // console.error(err)
                }
                else if (config['pg_lapig']['debug']) {
                    const duration = Date.now() - start
                    // console.log('Executed query', { query, duration, rows: result.rowCount })
                }
                callback(result)
            })

        } else if (!queryObj.hasOwnProperty('source') || queryObj.source == 'general') {
            return Internal['client-general'].query(query, (err, result) => {

                if (err !== null) {
                    // console.error(err)
                }
                else if (config['pg_general']['debug']) {
                    const duration = Date.now() - start
                    // console.log('Executed query', { query, duration, rows: result.rowCount })
                }
                callback(result)
            })
        }



    }

    return Client;
};
