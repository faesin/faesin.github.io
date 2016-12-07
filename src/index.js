
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

  //create a color for each frequency
  for (frequency in frequencies)
    colors.push(getRandomColor());

  startAmbient();
  createSliders();
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
  client = new Client((new AudioWM()).context, frequencies, adaptAmbient, onChangeFrequency);
}

function adaptAmbient() {

	return;
  //makes the client deaf to ambient sounds
  client.receiver.stream.disconnect(client.receiver.analyser);
  delete client.receiver.stream;

  //connect our sources with the client and set default gain value
  for (source of sources) {
    source.destination = client.receiver.analyser;
    source.gain.connect(source.destination);

    changeSourceGain(source, 0.5);
  }
}

function changeSourceGain(source, value) {
  source.gain.gain.value = value;
}

function onChangeFrequency(frequency) {

  var index = frequencies.indexOf(frequency);
  if (index != -1)
    $('body').css('background-color', colors[index]);
}


//
//INTERFACE

function showWarning() {
  $('#warning').show();
}

function createSliders() {

  var tableTitle = $('#sliders-title');
  var tableBody = $('#sliders-body');

  for (index in sources) {

    //get our colors and sources
    var source = sources[index];
    var color = colors[index];

    //create title
    var titleCell = $('<td>', {
      text:source.frequency
    });
    titleCell.css('background-color', color);

    //create slider
    var sliderCell = $('<td>');
    var slider = $('<input>', {
      type:'range',
      min:0,
      max:1,
      step:0.01,
      value:0.5
    });
    sliderCell.append(slider);

    //binding slider's moviment with source's gain
    slider.on('input change', onMoveSlider.bind(this, source));

    //puting sliders on the interface
    tableTitle.append(titleCell);
    tableBody.append(sliderCell);
  }
}

function onMoveSlider(source, e) {
  changeSourceGain(source, e.target.value);
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
