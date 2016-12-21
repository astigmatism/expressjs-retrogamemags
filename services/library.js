var DataService = require('./data.js');

LibraryService = function() {
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
