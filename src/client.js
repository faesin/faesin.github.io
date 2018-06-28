
function Client(context, frequencies, callback, onChange) {

  this.context = context;
  this.frequencies = frequencies;
  this.onChange = onChange;

  this.lastValue = 0;

  this.loop = this.checkingLoop;
  this.receiver = new Receiver(context, this.onClientReady.bind(this, callback), function(e) {console.log(e)});
}

Client.prototype.onClientReady = function(callback) {
  setTimeout(callback, 0);

  this.loop();
}

Client.prototype.checkingLoop = function() {

  //discovers the prominent frequency
  var intensities = this.receiver.getIntensityValues(this.frequencies);
  var prominent = 0;
  for (var i=1; i<intensities.length; i++)
    if (intensities[i] > intensities[prominent])
      prominent = i;

  //inform if the prominent frequency changed
  if (this.lastValue != frequencies[prominent]) {
    this.lastValue = frequencies[prominent];
    setTimeout(this.onChange.bind(this, this.lastValue), 0);
  }

  window.requestAnimationFrame(this.loop.bind(this));
}
