var request = require('requestify');

const CONNECTIONS = 'getConnections';

exports.getAirportConnections = function (airportCode, date, callback) {

    var connectionParser = function (json) {
        var connections = [];

        var quotes = json['Quotes'];
        for (var q = 0; q < quotes.length; q++) {
            var quote = quotes[q];
            if (!quote["Direct"])
                continue;

            // todo calculate from another api call
            var time = 2;
            var departureTime = quote["OutboundLeg"]["DepartureDate"];

            var price = quote["MinPrice"];

            var carrier = getCarrier(json, quote);
            var destination = getDestination(json, quote);

            connections.push({
                airport: destination,
                cost: price,
                time: time,
                departureTime: departureTime,
                carrier: carrier
            })
        }

        callback(connections);


        function getCarrier(json, quote) {
            var id = quote["OutboundLeg"]["CarrierIds"][0];
            var carriers = json["Carriers"];
            for (var i = 0; i < carriers.length; i++)
                if (carriers[i]["CarrierId"] == id)
                    return carriers[i]["Name"];
            return null;
        }

        function getDestination(json, quote) {
            var id = quote["OutboundLeg"]["DestinationId"];
            var places = json["Places"];
            for (var i = 0; i < places.length; i++)
                if (places[i]["PlaceId"] == id)
                    return places[i]["Name"];
            return null;
        }

    };

    requestApi(connectionParser, getApiUrl({
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

