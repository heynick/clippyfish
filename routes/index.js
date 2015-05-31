'use strict';
var express = require('express');
var router = express.Router();


// Type 3: Persistent datastore with automatic loading
var Datastore = require('nedb'),
	db = new Datastore({
		filename: './db/database.json',
		autoload: true
	});
// You can issue commands right away


/* GET home page. */
router.get('/', function(req, res) {
	res.render('index');
});

router.get('/paste', function(req, res) {

	db.find({}).sort({date: -1}).exec(function (err, docs) {

		if (err) {
			res.send('err');
		} else {
			res.send(docs);
		}

	});

});


// http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
if(!String.linkify) {
    String.prototype.linkify = function() {

        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        // Email addresses
        var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

        return this
            .replace(urlPattern, '<a href="$&" target="_blank">$&</a>')
            .replace(pseudoUrlPattern, '$1<a href="http://$2" target="_blank">$2</a>')
            .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
    };
}

router.post('/paste', function(req, res) {

	var pasteData = Object.keys(req.body)[0];
	var newPaste = {
		date: new Date(),
		data: pasteData.linkify()
	}


	db.insert(newPaste, function (err, newDoc) {
		// Callback is optional
	  	// newDoc is the newly inserted document, including its _id
	 	// newDoc has no key called notToBeSaved since its value was undefined

		//console.log(newDoc);



		if (err) {

			res.send('err');

		} else {

			db.find({}).sort({date: -1}).exec(function (err, docs) {

				if (err) {
					res.send('err');
				} else {
					res.send(docs);
				}

			});
		}


	});



});

module.exports = router;