const qs = require('qs')
const axios = require('axios')



module.exports = {
    

linenoti: function linenoty(msg){
    axios({
        method: 'post',
        url: 'https://notify-api.line.me/api/notify',
        headers: {
          'Authorization': 'Bearer ' + 'd1yODi3q1FULeA8QIS0KDJAewkktuvQS782QR2lWnFd',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Control-Allow-Origin': '*'
        },
        data: qs.stringify(msg)
      })
    .then( function(res) {
     if(res.status === 200){
         console.log('notification success')
         return(res.status)
     }
    })
    .catch( function(err) {
      console.error(err);
      return(err)
    });
}

}

