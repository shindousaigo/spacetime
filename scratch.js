const spacetime = require('./src/index')
// const spacetime = require('./immutable')

// var minus = spacetime('2018-07-09T12:59:00-07:00');
// console.log(minus.format('iso'));

// let s=spacetime('June 8th 1918').time('4:00pm').goto('Asia/Calcutta')
// console.log( s.format('iso'))
// console.log(spacetime.now().goto('America/New_York').format('iso'))
// console.log(spacetime.now().goto('America/New_York').format('iso'))
// console.log('2018-09-01T13:47:16-04:00')


// const day = spacetime('2018-09-23')
// console.log(day.format('time') + '\n')

// day.time('06:00')
// console.log(day.format('iso'))
// console.log(day.format('time'))


let day = spacetime.now()
console.log(day.time('6:00pm').time())

console.log('\n---\n')

const spacetime2 = require('./src/immutable')
const day2 = spacetime2.now()
console.log(day2.time('6:00pm').time())
