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



var sendDB = function(req,res, sendSingle) {
	// get all items in the db, sort them by date reversed

	if (sendSingle) {
		var limitLimit = 1;
	} else {
		var limitLimit = 10;
	}

	db.find({}).sort({date: -1}).limit(limitLimit).exec(function (err, docs) {

		if (err) {
			res.send('err');
		} else {
			res.send(docs);
		}

	});
}

router.get('/paste', function(req, res) {


	if (req.query.more) { // req.query.more contains the query string number value

		var skipFrom = req.query.more - 1; // -1 otherwise all are returned, for some reason??

		db.find({}).sort({date: -1}).skip(skipFrom).limit(10).exec(function (err, docs) {

			if (docs.length < 1) {
				res.send('butts');
				return;
			}

			if (err) {
				res.send('err');
			} else {
				res.send(docs);
			}

		});

	} else {

		// if no query, send all
		sendDB(req,res);

	}

});


// http://jsfiddle.net/tovic/HTt3N/
// http://jsfiddle.net/Victornpb/VSRFX/4/
var urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/ig;
var imgRegex = /(jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg)$/;

/**
 * JavaScript function to match (and return) the video Id
 * of any valid Youtube Url, given as input string.
 * @author: Stephan Schmitz <eyecatchup@gmail.com>
 * @url: http://stackoverflow.com/a/10315969/624466
 */
function youtubeChecker(url) {
  var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  return (url.match(p)) ? RegExp.$1 : false;
}

function youtubeIDGrabber(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11){
        return match[7];
    }else{
        alert("Url incorrecta");
    }
}


function parseURL(inputString){


    return inputString.replace(urlRegex, function(match){

            if (imgRegex.test(match)) {

                return '<img src="' + match + '"  alt=""/>';

            } else {

            	if (youtubeChecker(match)) {
            		return '<div class="yt-wrapper"><iframe width="420" height="315" src="https://www.youtube.com/embed/' + youtubeIDGrabber(match) +  '" frameborder="0" allowfullscreen></iframe></div>';
            	} else if ( /^(f|ht)tps?:\/\//i.test(match)) {
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

	console.log('yea' + rawPasteData);

	var newPaste = {
		date: new Date(),
		data: parseURL(strippedPasteData)
	}

	db.insert(newPaste, function (err, newDoc) {
	  	// newDoc is the newly inserted document, including its _id

		if (err) {
			res.send('err');
		} else {
			// pass in 'true' so that sendDB only sends the client 1 new item,
			// otherwise when 1 new item is added to the db, 10 will be served to the client. oops.
			sendDB(req,res, true);
		}

	});

});

module.exports = router;