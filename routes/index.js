'use strict';
var express = require('express');
var router = express.Router();


// Type 3: Persistent datastore with automatic loading
var Datastore = require('nedb'),
	db = new Datastore({
		filename: './db/database.json',
		autoload: true // You can issue commands right away
	});


/* GET home page. */
router.get('/', function(req, res) {
	res.render('index');
});


var sendDB = function(req,res) {
	// get all items in the db, sort them by date reversed
	db.find({}).sort({date: -1}).limit(6).exec(function (err, docs) {

		if (err) {
			res.send('err');
		} else {
			res.send(docs);
		}

	});
}

router.get('/paste', function(req, res) {

	sendDB(req,res);

});

router.get('/more', function(req, res) {

	console.log(req);

	db.find({}).sort({date: -1}).skip(6).limit(6).exec(function (err, docs) {

		if (err) {
			res.send('err');
		} else {
			res.send(docs);
		}

	});

});


// http://jsfiddle.net/tovic/HTt3N/
// http://jsfiddle.net/Victornpb/VSRFX/4/
var urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/ig;
var imgRegex = /(jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg)$/;

function parseURL(inputString){


    return inputString.replace(urlRegex, function(match){

            if (imgRegex.test(match)) {

                return '<img src="' + match + '"  alt=""/>';

            } else {

            	if ( /^(f|ht)tps?:\/\//i.test(match)) {
                	return '<a href="' + match + '" target="_blank">' + match + '</a>';
            	} else {
            		return '<a href="http://' + match + '" target="_blank">' + match + '</a>';
            	}
            }
        }
    );
}



router.post('/paste', function(req, res) {

	var rawPasteData = Object.keys(req.body)[0],
		strippedPasteData = rawPasteData.replace(/(<([^>]+)>)/ig,'');

	if (strippedPasteData.length > 1000) {
		res.send('string too long');
		return;
	}

	var newPaste = {
		date: new Date(),
		data: parseURL(strippedPasteData)
	}

	db.insert(newPaste, function (err, newDoc) {
	  	// newDoc is the newly inserted document, including its _id

		if (err) {
			res.send('err');
		} else {
			sendDB(req,res);
		}

	});

});

module.exports = router;