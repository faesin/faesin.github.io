var frequencies = [18600, 18800, 19000, 19200, 19400, 19600, 19800, 20000, 20200, 20400];
var client;
var sources = [];

var prominent;

//
//LOADING
$(document).ready(function() {

	//checking if we can use the device's microphone
	if(!navigator.getUserMedia && !navigator.webkitGetUserMedia && !navigator.mediaDevices.getUserMedia) {
		showWarning();
		return;
	}

	startAmbient();
	window.requestAnimationFrame(intensitiesLoop);
});

//
//CLIENT & SOURCES
function startAmbient() {

	//creating our audio context
	var context = (new AudioMarkings()).context;

	//start client and adapt out ambient
	client = new Client(context, frequencies, adaptAmbient, onChangeFrequency);
}

function adaptAmbient() {
}

function onChangeFrequency(frequency) {

	var index = frequencies.indexOf(frequency);

	if (index != -1) {
		prominent = index;
	}	
}

function intensitiesLoop() {
	var intensities = client.receiver.getIntensityValues(frequencies);
	var sum = 0;

	for(var index = 0; index < intensities.length; ++index) {
		sum += parseInt(intensities[index], 10);
		
		$("#" + frequencies[index]).html(frequencies[index].toString() + " = " + intensities[index]);
	}
	var average = sum / intensities.length;
	$("#average").html("average = " + average);
	$("#prominent").html("prominent = " + frequencies[prominent]);

	window.requestAnimationFrame(intensitiesLoop);
}

//
//INTERFACE
function showWarning() {
	$('#warning').show();
}
