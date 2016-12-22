var DataService = require('./data.js');

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

    LibraryService.getIssues(publicationFilter, function(err, publications) {
        if (err) {
            return callback(err);
        }

        //ensure we have unix time stamps
        for (publication in publications) {
            for (issue in publications[publication].issues) {

                var issueData = publications[publication].issues[issue];
                
                if (issueData.onshelf && issueData.offshelf) {
                    //no work atm
                } else {

                    if (issueData.month && issueData.year) {
                        var month = issueData.month.split('/');

                        console.log(month);
                    }
                }
            }
        }

        callback(null, publications);
    });
};

module.exports = LibraryService;
