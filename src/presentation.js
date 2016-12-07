var frequencies = [18600, 18800, 19000, 19200, 19400, 19600, 19800, 20000];
var sources = [];

var init = false;
var lastSource = 0;

//
//LOADING
$(document).ready(function() {

	if(!navigator.getUserMedia && !navigator.webkitGetUserMedia) {
	showWarning();
	return;
	}

	$('body').load('slides.html', function() {

		Reveal.addEventListener('ready', function(event) {
			startAmbient();
			console.log('slides ready');
		});
		Reveal.addEventListener('slidechanged', function(event) {
			console.log(event.indexh, event.indexv);

			changeSourceGain(sources[lastSource], 0)
			changeSourceGain(sources[event.indexh], 1);

			lastSource = event.indexh;
		});

		Reveal.initialize();
	});
});

//
//CLIENT & SOURCES

function startAmbient() {

  //creating our audio context
  var context = (new AudioWM()).context;

  //start sources
  for (frequency of frequencies)
	sources.push(new Source(context, frequency));

	for(source of sources) {
		source.start();
		source.gain.gain.value = 0;
	}
	
}

function changeSourceGain(source, value) {
	source.gain.gain.value = value;
}

//
//INTERFACE

function showWarning() {
  $('#warning').show();
}
