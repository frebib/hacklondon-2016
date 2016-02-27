var request = require('requestify');

const CONNECTIONS = 'getConnections';

exports.getAirportConnections = function (airportCode, date, callback) {

    requestApi(callback, getApiUrl({
        que: CONNECTIONS,
        from: airportCode,
        date: date
    }));
};


function requestApi(callback, apiUrl) {
    if (!apiUrl)
        return;

    // add api key (yuk)
    apiUrl += "?apiKey=" + process.env.API_KEY;

    console.log("Requesting: " + apiUrl);

    // request
    request
        .get(apiUrl)
        .then(function (res) {
            console.log("API says " + res.code);
            if (res.code == 200)
                callback(res.getBody());
        });
}

/**
 * @returns A URL to the API, or undefined if something went wrong
 */
function getApiUrl(params) {
    var apiCall = params['que'].trim();

    if (apiCall === CONNECTIONS) {

        var dateParam = params['date'];
        var fromParam = params['from'];
        if (dateParam && fromParam)
            return flightsFrom(fromParam, formatDate(dateParam));
    }

    return;
}

function flightsFrom(from, date) {
    return "http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/" +
        "GB/GBP/en-GB/" + from + "/anywhere/" + date;
}

function formatDate(date) {
    return date.getFullYear() + "-"
        + ('0' + (date.getMonth() + 1)).slice(-2) + "-"
        + ('0' + date.getDate()).slice(-2);
}

