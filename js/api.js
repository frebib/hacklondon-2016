/**
 * @param params url.parse(req.url)
 */
exports.parseGetParams = function(params) {

    if (!params || !params.query || !params.query['api'])
        return;

    var apiCall = params.query['api'].trim();
    var apiUrl;

    if (apiCall === 'getFlights') {

        var dateParam = params.query['date'];
        var cityParam = params.query['city'];
        if (!dateParam || !cityParam)
            return;

        apiUrl = getFlights(cityParam, dateParam)


    }

    return apiUrl;
};

function getFlights(fromCity, date) {
    return "http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/" +
        "GB/GBP/en-GB/" + fromCity + "/anywhere/" + date;
}