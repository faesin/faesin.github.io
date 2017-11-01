
var emitter

$(document).ready(function() {

  var url = window.location.href;
  url = url.replace('emissor', 'client');
  new QRCode($('div')[0], url);

  //start the emitter
  emitter = new Emitter();
  emitter.start();
});

//
//INTERFACE

function onChange() {
  var message = $('input').val();

  //if non-valid value, change it to 0
  message = (isNaN(message)) ? 0 : message;
  message = (message < 0 || message > 255) ? 0 : message;

  console.log('message: ' + message);
  emitter.setMessage(message);
}
