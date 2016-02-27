/**
 * @param params url.parse(req.url)
 */
exports.parseGetParams = function(params) {

    if (!params || !params['api'])
        return;

    var apiCall = params['api'].trim();
    var apiUrl;

    if (apiCall === 'getFlights') {

        var dateParam = params['date'];
        var cityParam = params['city'];
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