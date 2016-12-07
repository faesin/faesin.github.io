var frequencies = [18600, 18800, 19000, 19200, 19400, 19600, 19800, 20000];
var client;
var sources = [];

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
	// for (frequency of frequencies)
	// 	sources.push(new Source(context, frequency));

	//start client and adapt out ambient
	client = new Client((new AudioWM()).context, frequencies, adaptAmbient, onChangeFrequency);
}

function adaptAmbient() {
	return;
}

function onChangeFrequency(frequency) {
	var index = frequencies.indexOf(frequency);
	if (index != -1)
		Reveal.slide(index, 0);
}

//
//INTERFACE

function showWarning() {
	$('#warning').show();
}
