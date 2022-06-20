
const TOKEN = 'MzcIpu0EGR8040eJ0ObOA9sj6foGzrJPFj3pQG94Ck9dAPMtYZNw327ODTfrxm2XBmb3FHbV8voBpT/AWiLDyno+EeMA2aaZtGxC+5k33628DrRa8HNBCbxAB1B4U5RvVM3142ZQsNd4KSh/UxghcQdB04t89/1O/w1cDnyilFU='
const request =require('request')

module.exports = {

  linenoti: function reply(reply_token,msg) {
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
    let body = JSON.stringify({
      replyToken: reply_token,
      messages: [{
        type: 'text',
        text: msg
      }]
    })

    request.post({
      url: 'https://api.line.me/v2/bot/message/reply',
      headers: headers,
      body: body
  }, (err, res, body) => {
      console.log('status = ' + res.statusCode);
  })
}

}

