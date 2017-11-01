
var receiver;
var messages;
var length;

//
//LOADING

$(document).ready(function() {

  //checking if we can use the device's microphone
  if(!navigator.getUserMedia && !navigator.webkitGetUserMedia) {
    $('#warning').show();
    return;
  }
  $('#interface').show();

  receiver = new Receiver(onReceiverReady, function(e) {console.log(e);});
  receiver.oncheck = function() {
    length += 1;
    if (messages[receiver.lastMessage] == null)
      messages[receiver.lastMessage] = 0;
    messages[receiver.lastMessage] += 1;
  }
});

function onReceiverReady() {

  /* debugging *
  startEmitter();
  changeMessage(1);
  /* */
}

//
//CHECKING LOGIC

function startChecking() {
  messages = {};
  length = 0;
  showResult(null);

  setTimeout(function() {
    receiver.onChangeMessage = null;
    showResult(messages);
    toggleButton(false);
  }, 60000);
  receiver.onChangeMessage = function() {};
}

//
//INTERFACE

function onStart() {
  toggleButton(true);
  startChecking();
}

function toggleButton(disable) {
  $('button').prop('disabled', disable);
}

function showResult(result) {
  $('#result').empty();

  if (result) {
    if (result['NaN'] != null) {
      length -= result['NaN'];
      delete result['NaN'];
    }
    var message = '';
    for (var key of Object.keys(result))
      message += key + ': ' + ((result[key]*100)/length).toFixed(2) + '%<br/>';
    message += '<br/>iterations: ' + length;
    $('#result').append(message);
  }
}

//
//DEBUGGING

var emitter;
function startEmitter() {
  emitter = new Emitter(receiver.context);

  receiver.stream.disconnect(receiver.analyser);
  emitter.oscillator.connect(receiver.analyser);
  delete receiver.stream;

  emitter.start();
}

function changeMessage(message) {
  emitter.setMessage(message);
}
