'use strict'

var minimumIntensity = -85
var numberOfStates = 12
var states = Array.apply(null, {length: numberOfStates}).map(Number.call, Number)

// in gray codes
// Room <NUM> - <State> = <Transition>
// [1, 22, 44, 59, 79, 88, 98, 117, 138, 157, 167, 176, 196, 211, 233, 254]

//transition[current][message] = state
const transitions = {
  // Room 1
  1: {
    1: 1,
    22: 2,
    44: 3
  },
  2: {
    1: 1,
    22: 2,
    44: 3
  },
  3: {
    1: 1,
    22: 2,
    44: 3,
    59: 4
  },

  // Room 2
  4: {
    44: 3,
    59: 4,
    1: 5
  },
  5: {
    59: 4,
    1: 5,
    22: 6
  },

  // Room 3
  6: {
    1: 5,
    22: 6,
    44: 7,
    59: 8,
    79: 9,
    88: 10
  },
  7: {
    22: 6,
    44: 7,
    59: 8,
    79: 9
  },
  8: {
    22: 6, 
    44: 7,
    59: 8,
    79: 9
  },
  9: {
    22: 6,
    44: 7,
    59: 8,
    79: 9,
    88: 10
  },

  //Room 4
  10: {
    22: 6,
    79: 9,
    88: 10,
    1: 11
  },
  11: {
    88: 10,
    1: 11,
    22: 12,
  },
  12: {
    1: 11,
    22: 12
  }
}

let bouncingBuffer = Array(10).fill(NaN)

let currentState = 1


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


function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href
  }

  name = name.replace(/[\[\]]/g, "\\$&")
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)")
  var results = regex.exec(url)

  if (!results) {
    return null
  }

  if (!results[2]) {
    return ''
  }

  return decodeURIComponent(results[2].replace(/\+/g, " "))
}


$(document).ready(() => {
  let context, receiver

  if(!navigator.getUserMedia && !navigator.webkitGetUserMedia) {
    showWarning()
    return
  }

  if(getParameterByName('min') != null) {
    minimumIntensity = parseInt(getParameterByName('min'))
  }

  $('body').load('slides.html', function() {

    Reveal.addEventListener('ready', function(event) {
      context = (new AudioMarkings()).context
      receiver = new Receiver(context,
                              () => console.log('Receiver ready'),
                              (err) => console.error(err))

      checkForMessage()
      receiver.onChangeMessage = (value) => {
        console.log('changed', value)

        let positive = Math.max(...receiver.getIntensityValues(receiver.referencePositive, receiver.referenceNegative))

        console.log('positive: ', positive, 'minimumIntensity: ', minimumIntensity)
        console.log('positive >= minimumIntensity ? ', positive >= minimumIntensity)
        
        if(positive >= minimumIntensity) {
          let msg = receiver.getIntensityValues(receiver.messageFrequencies)
          
          for (let i = 0; i < msg.length; ++i) {
            msg[i] = (msg[i] >= minimumIntensity) ? 1 : 0;
          }

          msg = parseInt(msg.join(''), 2)
          console.log('activated', msg)

          // updateBouncingBuffer(msg)

          console.log(transitions[currentState])
          console.log(`transitions[${currentState}][${msg}]} = ${transitions[currentState][msg]}`)
          if (/*!isBouncing() && */transitions[currentState][msg] != null) {
            currentState = transitions[currentState][msg]

            console.log('state', msg)
            
            Reveal.slide(currentState - 1, 0)
          }
        }
      }
      
      Reveal.slide(currentState - 1 , 0)
    });
    
    Reveal.addEventListener('slidechanged', function(event) {
      console.log(event.indexh, event.indexv);
    });

    Reveal.initialize();
  });

  const checkForMessage = () => {
    
  }
})