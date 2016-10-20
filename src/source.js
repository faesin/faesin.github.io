
function Source(context, frequency) {

  this.context = context;
  this.frequency = frequency;
  this.destination = this.context.destination;

  this.oscillator = this.context.createOscillator();
  this.gain = this.context.createGain();

  this.oscillator.frequency.value = this.frequency;
  this.oscillator.connect(this.gain);
  this.oscillator.start();
}
Source.prototype.start = function() {
  this.gain.connect(this.destination);
}
Source.prototype.stop = function() {
  this.gain.disconnect(this.destination);
}
