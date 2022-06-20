const requireFromURL = require('require-from-url/sync')
const apikey = '0734b817bdc756b25e2c95cfb30af990'
const longdourl = `https://api.longdo.com/map/?key=${apikey}`
const requirelongdo = requireFromURL(longdourl)
const longdoapi = new requirelongdo


let testresponse = longdoapi.on()
console.log(testresponse)
let origin = {lat:13.213123,lon:102.21212}
let dest = {lat:13.112321,lon:100.21212}

// const response =  longdoapi.Util.distance([origin,dest])
// console.log(longdoapi)
// console.log(response)