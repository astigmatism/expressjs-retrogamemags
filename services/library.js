var DataService = require('./data.js');
var merge = require('merge');

LibraryService = function() {
};

LibraryService.getIssues = function(publicationFilter, callback) {
    
    var publications = {};

    DataService.getFile('/data/data.json', function(err, data) {
        if (err) {
            return callback(err);
        }

        for (publication in data.publications) {
            
            if ((publicationFilter && publication === publicationFilter) || (publicationFilter == undefined)) {    
                publications[publication] = data.publications[publication];
            }
        }

        callback(null, publications);
    });
};

LibraryService.getIssuesByDate = function(minDate, maxDate, publicationFilter, callback) {

    minDate = new Date(minDate);
    maxDate = new Date(maxDate);

    //make max date last day of month

    var result = {};

    LibraryService.getIssues(publicationFilter, function(err, publications) {
        if (err) {
            return callback(err);
        }

        //ensure we have unix time stamps
        for (publication in publications) {

            //put publication in response, but erase its issues
            result[publication] = merge(true, publications[publication]);
            result[publication].issues = {};

            for (issue in publications[publication].issues) {

                var issueData = publications[publication].issues[issue];
                
                if (issueData.onshelf && issueData.offshelf) {
                    //no work atm
                } else {

                    if (issueData.month && issueData.year) {
                        var month = issueData.month.split('/');

                        if (month.length > 0) {

                            var onshelf = new Date(month[0] + ' 1, ' + issueData.year);
                            
                            //need to final the final day of the month by first creating a date with the outgoing month, getting its int
                            // var offshelf = new Date(month[month.length - 1] + ' 1, ' + issueData.year);
                            // var offMonth = offshelf.getMonth();
                            // offshelf = new Date(issueData.year, offMonth + 1, 0);

                            //add these dates to the cache
                            issueData.onshelf = onshelf;
                            //issueData.offshelf = offshelf;
                        }
                    }
                }

                //compare date ranges
                if (issueData.onshelf >= minDate && issueData.onshelf < maxDate) {
                    result[publication].issues[issue] = issueData;
                }
            }
        }

        callback(null, result);
    });
};

module.exports = LibraryService;
