var express = require('express');
var config = require('config');
var FlowPaperHelpers = require('../tools/flowpaperhelpers.js');
var DataService = require('../services/data.js');
var LibraryService = require('../services/library.js');
var router = express.Router();

router.get('/bydate', function(req, res, next) {

	var min = req.query.min;
	var max = req.query.max;
	var publication = req.query.publication;

	LibraryService.getIssuesByDate(min, max, publication, function(err, results) {
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

router.all('/', function(req, res, next) {

	LibraryService.getIssues(undefined, function(err, publications) {
		if (err) {
            return res.json(err);
        }

        res.render('shelf', {
			publications: DataService.compress.json(publications),
			config: ''
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
