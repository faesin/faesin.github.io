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

	for(source of sources) {
		source.start();
		source.gain.gain.value = 0;
	}
	
}

function startEmitting() {
	var data = document.getElementById("data").value;
	var arr = data.split("")

	for(i in arr)
		if(arr[i] == 0)
			sources[i].gain.gain.value = 0;
		else
			sources[i].gain.gain.value = 1;


	// emitter.setMessage(data);
}