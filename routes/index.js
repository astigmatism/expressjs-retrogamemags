var express = require('express');
var config = require('config');
var FlowPaperHelpers = require('../tools/flowpaperhelpers.js');
var DataService = require('../services/data.js');
var LibraryService = require('../services/library.js');
var router = express.Router();

router.get('/bydate', function(req, res, next) {

	LibraryService.getIssuesByDate(min, max, function(err, results) {
		if (err) {
            return res.json(err);
        }
        res.json(results);
	});
});

router.get('/ui', function(req, res, next) {

	DataService.getFile('/data/data.json', function(err, data) {
		if (err) {
			return res.json(err);
		}

		FlowPaperHelpers.standardizeUi(config.magazinePath, config.flowPaperUiTemplate, data, function(err, data) {
			if (err) {
	            return res.json(err);
	        }
	        res.json(data);
		});
	});
});

//define last
router.get('/:publication', function(req, res, next) {
	
	var publication = req.params.publication;

	LibraryService.getIssues(publication, function(err, publications) {
		if (err) {
            return res.json(err);
        }

        res.render('shelf', {
			publications: DataService.compress.json(publications),
			config: ''
		});
	});
});


module.exports = router;
