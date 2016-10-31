var frequencies = [18600, 18800, 19000, 19200, 19400, 19600, 19800, 20000];
var client;
var sources = [];

var colors = [];

//
//LOADING
$(document).ready(function() {

	//checking if we can use the device's microphone
	if(!navigator.getUserMedia && !navigator.webkitGetUserMedia) {
		showWarning();
		return;
	}

	startAmbient();
});

//
//CLIENT & SOURCES
function startAmbient() {

	//creating our audio context
	var context = (new AudioWM()).context;

	//start sources
	for (frequency of frequencies)
		sources.push(new Source(context, frequency));

	//start client and adapt out ambient
	client = new Client(context, frequencies, adaptAmbient, onChangeFrequency);
}

function adaptAmbient() {

}

function changeSourceGain(source, value) {
	source.gain.gain.value = value;
}

function onChangeFrequency(frequency) {

	var index = frequencies.indexOf(frequency);
	if (index != -1) {
		$(frequencies[index].toString()).text(frequencies[index].toString() + sources[index].source.gain.gain.value);
	}
}

//
//INTERFACE
function showWarning() {
	$('#warning').show();
}

//
//UTILS
//source: http://stackoverflow.com/a/1484514/1269898
function getRandomColor() {
		var letters = '789ABCD'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++ ) {
				color += letters[Math.floor(Math.random() * letters.length)];
		}
		return color;
}
