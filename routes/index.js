var express = require('express');
var config = require('config');
var FlowPaperHelpers = require('../tools/flowpaperhelpers.js');
var DataService = require('../services/data.js');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('index', { 
		title: 'Retro Game Mags'
	});
});

router.get('/', function(req, res, next) {
	res.render('index', { 
		title: 'Retro Game Mags'
	});
});

router.get('/standardizeui', function(req, res, next) {

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


module.exports = router;
