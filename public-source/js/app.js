var app = app || {};

app = (function () {
	'use strict';

	var forceFocus = function() {

		document.getElementById('input').focus();

		if (window.chrome) {
			document.getElementById('input').remove();
		}



	};


	var ctrlTextChanger = function() {

		if ( navigator.platform.indexOf('Win') > -1) {
			document.getElementById('ctrl').innerText = 'Ctrl';
		}

	};


	var pasteEl = document.getElementById('paste');

	var handleBarsRender = function(resp, initial) {
		//  format an ISO date using Moment.js
		Handlebars.registerHelper('dateFormat', function(context, block) {
		  if (window.moment) {
		    return moment(context).fromNow();
		  } else {
		    return context; // moment plugin not available. return data as is.
		  };
		});

		var respFile = JSON.parse(resp),
	    	source = document.getElementById('template').innerHTML,
	    	template = Handlebars.compile(source),
	    	html = template(respFile);


	    // don't transition the first element if this is page load
	    if (initial) {
		    pasteEl.innerHTML = html;
	    } else {
	    	pasteEl.innerHTML = html;

	    	var newEl = pasteEl.childNodes[1];
	    	newEl.classList.add('new');
	    	newEl.setAttribute('reveal', true);
	    }



	};

	var initialRender = function() {

		var requestGet = new XMLHttpRequest();
		requestGet.open('GET', '/paste', true);

		requestGet.onload = function() {

		  if (requestGet.status >= 200 && requestGet.status < 400){
			    // Success!
			    handleBarsRender(requestGet.responseText, true);

			}
		};

		requestGet.send();

	};


	var paste = function() {

		document.onpaste = function(e) {
		    var paste = e.clipboardData && e.clipboardData.getData ?
		        e.clipboardData.getData('text/plain') :                // Standard
		        window.clipboardData && window.clipboardData.getData ?
		        window.clipboardData.getData('Text') :                 // MS
		        false;

		    if (paste) {

		        postToServer(paste);

		    }
		};

	};

	var postToServer = function(paste) {

		var serverPaste = new XMLHttpRequest();
		serverPaste.open('POST', '/paste', true);
		serverPaste.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );

		serverPaste.onreadystatechange = function () {
			// readystate 4 means 'complete'
			// status 200 means perfect
			if (serverPaste.readyState !== 4 || serverPaste.status !== 200) {
				return;
			};

			if (serverPaste.responseText !== 'err') {

				handleBarsRender(serverPaste.responseText, false);

			} else {

				console.log('something fucked up on the server');

			}

		};

		serverPaste.send(paste);

	};


	return {
		forceFocus: forceFocus,
		initialRender: initialRender,
		ctrlTextChanger: ctrlTextChanger,
		paste: paste
	};

}());