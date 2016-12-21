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

LibraryService.getIssuesByDate = function(minDate, maxDate, callback) {
    
    var result = [];

    DataService.getFile('/data/data.json', function(err, data) {
        if (err) {
            return callback(err);
        }


        callback(null, result);
    });
};

module.exports = LibraryService;
