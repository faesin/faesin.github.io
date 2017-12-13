'use strict'

function AudioMarkings (context) {
  this.context = (context instanceof AudioContext) ? context : new (window.AudioContext || window.webkitAudioContext)()
}

AudioMarkings.prototype.createSignalsArray = function (trueFundamental, fundamental, numBits, disableNormalization) {
  // considering 1 extra bit for the reference frequency
  
  const frequencyLimit = trueFundamental + (numBits * fundamental)
  const length = (frequencyLimit / fundamental)

  // create a string with a number of 0s equal to numBits
  const overheadZeros = Array(numBits).fill(0).join('')

  // create sine and cosine arrays
  const real = new Float32Array(length + 1) // +1 for the first argument of fft arrays
  const imag = new Float32Array(real.length)

  // populate waveArray with periodic waves
  let wave, waveArray = [], waveArrayLength = Math.pow(2, numBits)

  for (let i = 0; i < waveArrayLength; i++) {
    // constructs each overtone structure
    let bitSequence = (overheadZeros + i.toString(2)).slice(-numBits)
    bitSequence = bitSequence.split('').join('')

    for (let j = 0; j < bitSequence.length; j++) { real[real.length - (bitSequence.length - j + 1)] = parseInt(bitSequence[j]) }

    real[real.length - 1] = 1

    // create periodic wave and populate waveArray
    wave = this.context.createPeriodicWave(real, imag, { disableNormalization })
    waveArray.push(wave)
  }

  return waveArray
}
