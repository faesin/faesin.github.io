
function Emitter(context, options) {
  const defaultOpt = {
    disableNormalization: false //disableNormalization on createPeriodicWave
  }

  options = Object.assign(defaultOpt, this.defaultMessageParameters, options)
  
  AudioMarkings.call(this, context)

  this.oscillator = this.context.createOscillator()
  this.oscillator.start()

  this.initialize(options) //initializes with default behavior
}

Emitter.prototype = Object.create(AudioMarkings.prototype)
Emitter.prototype.initialize = function(options) {

  //default behavior
  start = !options.start || Number.isNaN(options.start) ? this.defaultMessageParameters.start : options.start
  mdc = !options.mdc || Number.isNaN(options.mdc) ? this.defaultMessageParameters.mdc : options.mdc
  bitLength = !options.bitLength || Number.isNaN(options.bitLength) ? this.defaultMessageParameters.bitLength : options.bitLength

  this.signals = this.createSignalsArray(start, mdc, bitLength, Boolean(options.disableNormalization))
  this.oscillator.frequency.value = mdc
  this.setMessage(0)
}

//
//EMITTER LOGIC

Emitter.prototype.setMessage = function(message) {
  this.oscillator.setPeriodicWave(this.signals[message])
}
Emitter.prototype.start = function() {
  this.oscillator.connect(this.context.destination)
}
Emitter.prototype.stop = function() {
  this.oscillator.disconnect(this.context.destination)
}

//
//CONSTANTS

Emitter.prototype.defaultMessageParameters = {
  start: 18600,
  mdc: 200,
  bitLength: 8
}
