var express = require('express');
var config = require('config');
var FlowPaperHelpers = require('../tools/flowpaperhelpers.js');
var DataService = require('../services/data.js');
var LibraryService = require('../services/library.js');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('store', { 
		title: 'Retro Game Mags'
	});
});

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

	DataService.getFile('/data/data.json', function(err, data) {
		if (err) {
			return res.json(err);
		}

		if (data.publications[publication]) {

			res.render('shelf', { 
				title: 'Retro Game Mags: ' + data.publications[publication].name,
				publication: publication,
				data: data.publications[publication]
			});
		
		} else {
			res.json(publication + ' is not found');
		}
	});
});


module.exports = router;
