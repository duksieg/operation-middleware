const qs = require('qs')
const axios = require('axios')



module.exports = {
    

linenoti: function linenoty(msg){
    axios({
        method: 'post',
        url: 'https://notify-api.line.me/api/notify',
        headers: {
          'Authorization': 'Bearer ' + 'jWbyfZAqobSdfy7fLtMUJ0wqtRJt1hGwI8xHpuxzYLa',
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

