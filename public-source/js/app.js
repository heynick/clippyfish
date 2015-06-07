var app = app || {};

app = (function () {
	'use strict';

	var doc = document;

	var inputEl = doc.getElementById('input'),
		errorEl = doc.getElementById('error'),
		pasteEl = doc.getElementById('paste'),
		introEl = doc.getElementById('intro-text');

	var	inputFieldVisible = !window.chrome || (window.chrome && screen.width < 768) ? true : false,
		bottomReached = false;


	var forceFocus = function() {

		// only chrome desktop supports actual ctrl+v paste
		// so all others must see the text input

		if ( inputFieldVisible ) {
			introEl.innerHTML = 'Paste your junk into the textfield';
			inputEl.classList.add('visible');
			inputEl.focus();
		}

	};


	var ctrlTextChanger = function() {

		if ( navigator.platform.indexOf('Win') > -1) {
			doc.getElementById('ctrl').innerText = 'Ctrl';
		}

	};


	var loadMore = function() {

		function debounce(func, wait, immediate) {
			var timeout;
			return function() {
				var context = this, args = arguments;
				var later = function() {
					timeout = null;
					if (!immediate) func.apply(context, args);
				};
				var callNow = immediate && !timeout;
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if (callNow) func.apply(context, args);
			};
		};

		var increment = 10, // needs to also mirror the limit on server
			loadMoreCount = 1;

		var efficientScroll = debounce(function() {

			if (bottomReached) return;

		    if ((window.innerHeight + window.scrollY) >= doc.body.offsetHeight) {

		        var requestGet = new XMLHttpRequest();
		        requestGet.open('GET', '/paste?more=' + (loadMoreCount * increment), true);

		        requestGet.onload = function() {

		        	if (requestGet.responseText === 'butts') {
		        		// generate and render the butts markup

		        		var buttWrapper = doc.createElement('div'),
		        			buttImg = doc.createElement('img'),
		        			buttTxt = doc.createElement('p');

		        		buttImg.src = '/img/bottom.gif';
		        		buttTxt.innerHTML = "You've reached the bottom!";

		        		buttWrapper.id = 'butt-wrapper';
		        		buttWrapper.appendChild(buttTxt);
		        		buttWrapper.appendChild(buttImg);

		        		pasteEl.appendChild(buttWrapper);

		        		bottomReached = true;

		        	} else if (requestGet.status >= 200 && requestGet.status < 400) {
		        	    // Success!
		        	    handleBarsRender(requestGet.responseText, true);
				        loadMoreCount++;

		        	}
		        };

		        requestGet.send();

			};

	    }, 500);

		window.addEventListener('scroll', efficientScroll);

	};


	//  format an ISO date using Moment.js
	Handlebars.registerHelper('dateFormat', function(context, block) {
	  	if (window.moment) {
	    	return moment(context).fromNow();
	  	} else {
	    	return context; // moment plugin not available. return data as is.
	  	};
	});

	var handleBarsRender = function(resp, initial) {

		var respFile = JSON.parse(resp),
	    	source = doc.getElementById('template').innerHTML,
	    	template = Handlebars.compile(source),
	    	html = template(respFile);


	    // don't transition the first element if this is page load
	    if (initial) {

	    	pasteEl.insertAdjacentHTML('beforeend', html);

	    } else {
	    	pasteEl.insertAdjacentHTML('afterbegin', html);

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

		var lastPaste = 0,
			pasteWait = 2500;

		doc.addEventListener('paste', function(e) {

			if (Date.now() - lastPaste > pasteWait) {

			    var paste = e.clipboardData && e.clipboardData.getData ?
			        e.clipboardData.getData('text/plain') :                // Standard
			        window.clipboardData && window.clipboardData.getData ?
			        window.clipboardData.getData('Text') :                 // MS
			        false;

			    if (paste) {
			        postToServer(paste);
			    }

			    lastPaste = Date.now();

			} else {
				errorEl.innerHTML = "Hold your horses there matey, give it a few seconds";
				showError();
			}


		});

	};


	var showError = function() {
		errorEl.classList.add('visible');

		setTimeout(function() {
			errorEl.classList.remove('visible');
		}, 2500)
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

			if (serverPaste.responseText === 'string too long') {
				inputEl.value = '';
				errorEl.innerHTML = "That's a bit too much text, try cutting it back to less than 2000 characters.";
				showError();
				return;
			}

			if (serverPaste.responseText !== 'err') {
				// all good in the hood

				// reset the load more and bottom flag, seeing as we are clearing the #paste dom
		        //loadMoreCount = 1;
		        //bottomReached = false;

				errorEl.classList.remove('visible');
				handleBarsRender(serverPaste.responseText, false);

				if (inputFieldVisible) {
					introEl.remove();
					inputEl.value = '';
				}

			} else {
				errorEl.innerHTML = "Something rooted up happened on the server. Sorry about that.";
				showError();

			}

		};

		serverPaste.send(paste);
	};


	return {
		forceFocus: forceFocus,
		initialRender: initialRender,
		ctrlTextChanger: ctrlTextChanger,
		loadMore: loadMore,
		paste: paste
	};

}());