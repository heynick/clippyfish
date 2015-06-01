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

var sendDB = function(req,res) {
	// get all items in the db, sort them by date reversed
	db.find({}).sort({date: -1}).exec(function (err, docs) {

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

var anchorMaker = function(inputStr) {

	var count = 0;

	// Make an array of urls
	var urls = inputStr.match(/(?:^|[^"'])(\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|])/gim);

	urls.forEach(function(v,i,a) {
	    var n = inputStr.indexOf(v,count); //get location of string

	    if (v.match(/\.(png|jpg|jpeg|gif)$/)===null){// Check if image
	        // If link replace inputStr with new  anchor tag
	        inputStr  = strSplice(inputStr,n,v.length,'<a href="'+v+'">'+v+'</a>');
	        count += (v.length*2)+16;// Increase count incase there are multiple of the same url.

	    } else {
	        // If link replace inputStr with img tag
	        inputStr  = strSplice(inputStr,n,v.length,'<img src="'+v+'" height="120px;" width="120px;"/>');
	       	count += v.length+14;// Increase count incase there are multiple of the same url.
	    }


	});

	return inputStr;

	// A function to splice strings that I found on another StackOverflow Question.
	function strSplice(str, index, count, add) {
	  return str.slice(0, index) + (add || "") + str.slice(index + count);
	}

};


var __urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/ig;
var __imgRegex = /(jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg)$/;


// http://jsfiddle.net/tovic/HTt3N/
// http://jsfiddle.net/Victornpb/VSRFX/4/
function parseURL($string){


    return $string.replace(__urlRegex, function(match){

            if (__imgRegex.test(match)) {
                return '<img src="'+ match +'" />';

            } else {

            	if ( /^(f|ht)tps?:\/\//i.test(match)) {
                	return '<a href="'+match+'" target="_blank">'+match+'</a>';

            	} else {
            		return '<a href="http://'+match+'" target="_blank">'+match+'</a>';

            	}
            }
        }
    );
}



// http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
/*if(!String.linkify) {
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
}*/

router.post('/paste', function(req, res) {


	var pasteData = Object.keys(req.body)[0],
		newPaste = {
		date: new Date(),
		data: parseURL(pasteData) //pasteData.linkify()
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