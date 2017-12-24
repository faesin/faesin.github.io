'use strict'

const minimumIntensity = -85
const numberOfStates = 12
const states = Array.apply(null, {length: numberOfStates}).map(Number.call, Number)

// in gray codes
// Room <NUM> - <State> = <Transition>
const transitions = {
  // Room 1 - 1 = 1; 2 = 2; 3 = 3
  1: { 1: 1, 2: 2, 3: 3 },
  2: { 1: 1, 2: 2, 3: 3 },
  3: { 1: 1, 2: 2, 3: 3, 4: 4 },

  // Room 2 - 5 = 1; 6 = 2; 3 = 3; 4 = 4
  4: { 1: 5, 3: 3, 4: 4 },
  5: { 1: 5, 2: 6, 4: 4 },

  // Room 3 - 5 = 1; 6 = 2; 9 = 3; 7 = 4; 8 = 5; 10 = 6
  6: { 1: 5, 2: 6, 3: 9, 4: 7, 5: 8, 6: 10 },
  7: { 2: 6, 3: 9, 4: 7, 5: 8, 6: 10 },
  8: { 2: 6, 3: 9, 4: 7, 5: 8 },
  9: { 2: 6, 3: 9, 4: 7, 5: 8 },

  //Room 4 - 11 = 1; 12 = 2; 7 = 4; 10 = 6
  10: { 1: 11, 2: 12, 4: 7, 6: 10 },
  11: { 1: 11, 2: 12, 6: 10},
  12: { 1: 11, 2: 12}
}

let bouncingBuffer = Array(10).fill(NaN)

let currentState = 1

function toGrayCode(n) {
  if (n < 0) throw new RangeError("cannot convert negative numbers to gray code");

  return n ^ (n >>> 1)
}

function fromGrayCode(gn) {
  if (gn < 0) throw new RangeError('gray code numbers cannot be negative')

  var g = gn.toString(2).split('')
  var b = []
  b[0] = g[0]
  for (var i = 1; i < g.length; i++)
    b[i] = g[i] ^ b[i - 1]

  return parseInt(b.join(""), 2)
}

function showWarning() {
  $('#warning').show()
}

function updateBouncingBuffer (message) {
  bouncingBuffer.push(message)
  bouncingBuffer.shift()
}

function isBouncing () {
  for (let i = 1; i < bouncingBuffer.length; i++)
    if (bouncingBuffer[i] !== bouncingBuffer[i-1])
      return true
  
  return false
}

$(document).ready(() => {
  let context, receiver

  if(!navigator.getUserMedia && !navigator.webkitGetUserMedia) {
    showWarning()
    return
  }

  const checkForMessage = () => {
    let positive = Math.max(...receiver.getIntensityValues(receiver.referencePositive, receiver.referenceNegative))
    $('#positive').html(`Positive Intensity: ${positive}`)

    $('#pIsValid').html(`positive >= minimumIntensity : ${positive >= minimumIntensity}`)

    if(positive >= minimumIntensity) {
      let msg = receiver.getIntensityValues(receiver.messageFrequencies)
      
      for (let i = 0; i < msg.length; ++i) {
        msg[i] = (msg[i] >= minimumIntensity) ? 1 : 0;
      }

      msg = parseInt(msg.join(''), 2)

      document.getElementById('received').innerHTML = `Received ${msg}`

      updateBouncingBuffer(msg)

      if (!isBouncing() && transitions[currentState][msg] != null) {
        currentState = transitions[currentState][msg]
        
        $('#state').html(`Current State: ${currentState}`)
      }
    }

    window.requestAnimationFrame(checkForMessage)
  }

  context = (new AudioMarkings()).context
  receiver = new Receiver(context,
                          () => console.log('Receiver ready'),
                          (err) => console.error(err))

  $('#state').html(`Current State: ${currentState}`)
  $('#received').html(`Received ${null}`)
  checkForMessage()
  receiver.onChangeMessage = (wew) => { }
})