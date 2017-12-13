'use strict'

function Emitter (context, options) {
  const defaultOpt = {
    disableNormalization: false // disableNormalization on createPeriodicWave
  }

  this.options = Object.assign(defaultOpt, this.defaultMessageParameters, options)

  AudioMarkings.call(this, context)

  this.oscillator = this.context.createOscillator()
  this.oscillator.start()

  this.initialize(this.options) // initializes with default behavior
}

Emitter.prototype = Object.create(AudioMarkings.prototype)
Emitter.prototype.initialize = function (options) {
  // set behavior
  const start = !options.start || Number.isNaN(options.start) ? this.defaultMessageParameters.start : options.start
  const mdc = !options.mdc || Number.isNaN(options.mdc) ? this.defaultMessageParameters.mdc : options.mdc
  const bitLength = !options.bitLength || Number.isNaN(options.bitLength) ? this.defaultMessageParameters.bitLength : options.bitLength

  this.options = Object.assign(this.options, {start, mdc, bitLength})

  this.signals = this.createSignalsArray(start, mdc, bitLength, Boolean(options.disableNormalization))
  this.oscillator.frequency.value = mdc
  this.setMessage(0)
}

//
// EMITTER LOGIC

Emitter.prototype.setMessage = function (message) {
  this.oscillator.setPeriodicWave(this.signals[message])
}
Emitter.prototype.start = function () {
  this.oscillator.connect(this.context.destination)
}
Emitter.prototype.stop = function () {
  this.oscillator.disconnect(this.context.destination)
}

Emitter.prototype.getMessageParameters = function () {
  return {
    start: this.options.start,
    mdc: this.options.mdc,
    bitLength: this.options.bitLength
  }
}

Emitter.prototype.calculateReferenceFrequencies = function () {
  const message = []
  let positive, negative

  for(let i = 0; i < this.options.bitLength; i++) {
    message.push(this.options.start + this.options.mdc * i)
  }

  positive = message[message.length - 1] + this.options.mdc
  negative = positive + this.options.mdc

  return {message, positive, negative}
}

//
// CONSTANTS

Emitter.prototype.defaultMessageParameters = {
  start: 18600,
  mdc: 200,
  bitLength: 8
}
