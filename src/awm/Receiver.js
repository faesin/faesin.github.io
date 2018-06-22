function Receiver (context, onStart, onError, constraints, options) {
  AudioMarkings.call(this, context)

  this.analyser = this.context.createAnalyser()
  this.analyser.smoothingTimeConstant = 0

  const defaultOpt = {
    disableBounce: false,
    bounceLenght: 10,
    referenceFrequencies: this.defaultReferenceFrequencies,
    disableReferenceNormalization: false
  }

  this.options = (options instanceof Object) ? Object.assign(defaultOpt, options) : defaultOpt

  // preparing individual messages-specific events
  this.events = {}
  this.loop = this.nullFunction
  this.lastMessage = NaN

  if (this.options.bounceLenght != null && !Number.isNaN(this.options.bounceLenght)) { this.bouncingBuffer = Array(this.options.bounceLenght).fill(NaN) } else { this.bouncingBuffer = Array(10).fill(NaN) }

  // preparing onChangeMessage event
  var onChangeMessage = this.nullFunction
  var nullFunctionRef = this.nullFunction
  var manageEventLoopRef = this.manageEventLoop
  Object.defineProperty(this, 'onChangeMessage', {
    get: function () {
      return onChangeMessage
    },
    set: function (value) {
      onChangeMessage = (value instanceof Function) ? value : nullFunctionRef
      manageEventLoopRef.call(this)
    }}
  )

  // starting with default frequency values ( > 18600Hz)
  let referenceFrequencies = this.options.referenceFrequencies
  this.initialize(referenceFrequencies.message, referenceFrequencies.positive, referenceFrequencies.negative)

  this.constraints = (constraints instanceof Object) ? constraints : this.defaultMediaStreamConstraints

  // requesting the user's microphone
  if (navigator.mediaDevices.getUserMedia) {
    console.log('==================== getSupportedConstraints ====================')
    console.log(navigator.mediaDevices.getSupportedConstraints())
    console.log('=================================================================')
    navigator.mediaDevices.getUserMedia(this.constraints).then(this.onMicrophoneReady.bind(this, onStart)).catch(onError)
  } else {
    // support for deprecated version of getUserMedia
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
    getUserMedia.call(navigator, this.constraints, this.onMicrophoneReady.bind(this, onStart), onError)
  }
}

Receiver.prototype = Object.create(AudioMarkings.prototype)

Receiver.prototype.initialize = function (messageFrequencies, referencePositive, referenceNegative) {
  this.messageFrequencies = (messageFrequencies instanceof Array) ? messageFrequencies : this.defaultReferenceFrequencies.message
  this.referencePositive = (referencePositive == null || Number.isNaN(referencePositive)) ? this.defaultReferenceFrequencies.positive : referencePositive
  this.referenceNegative = (referenceNegative == null || Number.isNaN(referenceNegative)) ? this.defaultReferenceFrequencies.negative : referenceNegative
}

Receiver.prototype.onMicrophoneReady = function (callback, microphoneStream) {
  this.stream = this.context.createMediaStreamSource(microphoneStream)
  this.stream.connect(this.analyser)

  callback()
}

//
// RECEIVER LOGIC
Receiver.prototype.checkMessage = function () {
  // getting intensity values
  const messageIntensities = this.getIntensityValues(this.messageFrequencies),
    referenceIntensities = this.getIntensityValues(this.referencePositive, this.referenceNegative)

  // sometimes hight frequencies' intensity gets much lower than normal
  // so i'm preventing my reference negative frequency from getting lower than 'quiet' (-100db)
  // referenceIntensities[1] = Math.max(referenceIntensities[1], -100)

  // Sometimes, interference puts positive bellow negative, so we change that
  let max, min
  if (!this.options.disableReferenceNormalization) {
    max = Math.max(referenceIntensities[0], referenceIntensities[1])
    min = Math.min(referenceIntensities[0], referenceIntensities[1])
  } else {
    max = referenceIntensities[0]
    min = referenceIntensities[1]
  }

  // decoding the message
  let bit, message = 0, differenceToPositive, differenceToNegative

  for (var i = 0; i < messageIntensities.length; i++) {
    differenceToPositive = Math.abs(messageIntensities[i]) - Math.abs(max)
    differenceToNegative = Math.abs(messageIntensities[i]) - Math.abs(min)
    differenceToPositive = Math.abs(differenceToPositive)
    differenceToNegative = Math.abs(differenceToNegative)

    bit = (differenceToPositive < differenceToNegative) ? 1 : 0
    message += bit << messageIntensities.length - i - 1
  }

  return message
}

Receiver.prototype.getIntensityValues = function () {
  const frequencies = [].concat.apply([], arguments)

  let freqDomain = new Float32Array(this.analyser.frequencyBinCount)

  this.analyser.getFloatFrequencyData(freqDomain)
  const nyquist = this.context.sampleRate / 2

  let intensities = [], index
  for (var i = 0; i < frequencies.length; i++) {
    index = Math.round(frequencies[i] / nyquist * freqDomain.length)
    intensities.push(freqDomain[index])
  }

  return intensities
}

//
// EVENT HANDLING
Receiver.prototype.manageEventLoop = function () {
  // stop event loop if there is no more events and onChangeMessage is null
  if (Object.keys(this.events) < 1 && this.onChangeMessage === this.nullFunction) {
    this.loop = this.nullFunction
    this.bouncingBuffer.fill(NaN)
  } else {
    const eventLoop = this.loop
    this.loop = this.checkMessageLoop

    // start event loop if it wasn't running before
    if (eventLoop === this.nullFunction) this.loop()
  }
}

Receiver.prototype.addMessageEvent = function (message, callback) {
  if (this.events[message] == null) this.events[message] = []

  this.events[message].push(callback)

  this.manageEventLoop()
}

Receiver.prototype.removeMessageEvent = function (message, callback) {
  if (this.events[message] != null) {
    const index = this.events[message].indexOf(callback)

    if (index > -1) {
      this.events[message].splice(index, 1)

      if (this.events[message].length < 1) delete this.events[message]
    }
  }

  this.manageEventLoop()
}

Receiver.prototype.checkMessageLoop = function () {
  const message = this.checkMessage()
  this.updateBouncingBuffer(message)

  // only do something if message has changed and it's not bouncing
  if (this.lastMessage !== message && (this.options.disableBounce || !this.isBouncing(message))) {
    // call user's onChangeMessage event
    setTimeout(this.onChangeMessage.bind(this, message), 0)

    // call user's message-specific events
    if (this.events[message] != null) {
      for (callback of this.events[message]) { setTimeout(callback, 0) }
    }

    // update message
    this.lastMessage = message
  }

  requestAnimationFrame(this.loop.bind(this))
}

Receiver.prototype.updateBouncingBuffer = function (message) {
  this.bouncingBuffer.push(message)
  this.bouncingBuffer.shift()
}

Receiver.prototype.isBouncing = function () {
  for (let i = 1; i < this.bouncingBuffer.length; i++) {
    if (this.bouncingBuffer[i] !== this.bouncingBuffer[i - 1]) { return true }
  }

  return false
}

//
// UTILS

// my 'Null Object' function (it can look strange, but believe me, it's damn useful!)
Receiver.prototype.nullFunction = function () { }

//
// CONSTANTS
Receiver.prototype.defaultMediaStreamConstraints = {
  audio: {
    echoCancellation: false,
    autoGainControll: false,
    noiseSuppression: false

    // mandatory: { echoCancellation: false },
    // optional: [
    //   {googEchoCancellation: false},
    //   {googAutoGainControl: false},
    //   {googAutoGainControl2: false},
    //   {googNoiseSuppression: false},
    //   {googHighpassFilter: false},
    //   {googTypingNoiseDetection: false}
    // ]
  },
  video: false
}

Receiver.prototype.defaultReferenceFrequencies = {
  message: [18600, 18800, 19000, 19200, 19400, 19600, 19800, 20000],
  positive: 20200,
  negative: 20400
}
