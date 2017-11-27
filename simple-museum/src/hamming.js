'use strict'

const encode = function(input, options) {
  if(typeof input !== 'string' || input.match(/[^10]/)) throw new Error('Invalid input. Should be a string binary')

  const encoded = [...input.split('')]
  let numParityBits = 0

  //Calculate the number of parity bits necessary for the message
  while(encoded.length > (Math.pow(2, numParityBits) - numParityBits - 1))
    numParityBits++

  //Create the encoded message with the parity bits  
  for(let i = 0; i < numParityBits; i++)
    encoded.splice((Math.pow(2, i) - 1), 0, null)
  
  for(let i = encoded.length; i >= 0; i--) {
    if(encoded[i] !== null) continue

    encoded[i] = '' + encoded.reduce((acc, val, curIndex) => {
      if(i >= curIndex) return acc

      // If this bit is covered by the current parity bit, XOR to parity
      if((curIndex + 1) & (i + 1)) return Number(val)^acc

      return acc
    }, 1)
  }

  return encoded.join('')
}

const decode = function(input, options) {
  if(typeof input !== 'string' || input.match(/[^10]/)) throw new Error('Invalid input. Should be a string binary')

  let numParityBits = 0

  //Discover how many bits are parity bits
  while(input.length > (Math.pow(2, numParityBits) - 1))
    numParityBits++

  const parityBits = [],
        parityBitsPos = [],
        message = [...input.split('')]

  //Get which bits are parity bits
  for(let i = 0; i < numParityBits; i++) 
    parityBitsPos.push(Math.pow(2, i) - 1)

  //Calculate the parity of the current message
  parityBitsPos.forEach(val => {
    let parity = 1
    for(let i = val; i < input.length; i++) {

      if((i + 1) & (val + 1)) {
        parity ^= Number(message[i])
      }
    }

    parityBits.push(parity)

  })

  let error = parityBits.reduce((acc, val, curIndex) => {
    return acc + (val * (parityBitsPos[curIndex] + 1))
  }, 0)

  const stripParityBits = (msg, parPos) => {
    let ret = [], i = 0
    
    msg.forEach((val, index) => {
      if(index === parPos[i]) {
        i++
        return
      }

      ret.push(val)
    })

    return ret
  }

  //No error found
  if(!error) return stripParityBits(message, parityBitsPos).join('')

  //Flip the erroneous bit
  message[error - 1] = 1 - message[error - 1]
  return stripParityBits(message, parityBitsPos).join('')
}