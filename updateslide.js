
const { google } = require('googleapis');

const authcreds = new google.auth.GoogleAuth({
  keyFile: "./key.json", //the key file
  scopes: ["https://www.googleapis.com/auth/presentations", "https://www.googleapis.com/auth/drive"]
});

const slide = google.slides({
  version: 'v1',
  auth: authcreds
});

const drive = google.drive({
  version: 'v3',
  auth: authcreds
});

const presentationID = '1F_8BpDtLQF5fiAd2RbL0NRg5YCh3zzPxbcedRrUazgI'
const templateslide = 'p'

module.exports = {
  listslide: listslides = () => {
    slide.presentations.get({
      presentationId: presentationID,
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const length = res.data.slides.length;
      console.log('The presentation contains %s slides:', length);
      res.data.slides.map((slide, i) => {
        console.log(slide.pageElements[0]);
      });
    });
  },



  updatetext: updatetext = async () => {
    let pointname = 'รัฐวิชญ์  '
    let pointno = '1A1'
    var newIDs = ["copiedSlide_001", "copiedSlide_002", "copiedSlide_003"]
    // find template slide or first slide
    // try{
    // let findtemplate =await  slide.presentations.get(
    //   {
    //     presentationId: presentationID,
    //     fields: "slides(objectId)",
    //   })
    //   findtemplate.data.slides[0].objectId
    // }catch(err){
    //   console.error('could not load template slide'+err)
    // }
    
    for (let index = 0; index < newIDs.length; index++) {
      let element = newIDs[index];
    try {
      let requests = [ 
        {
        duplicateObject: {
          objectId: templateslide
        }
      },
      {
        replaceAllText: {
           containsText: {
             text: '{{point-name}}',
             matchCase: true
           },
           replaceText: element
        }
      }]  

      slide.presentations.batchUpdate({
        presentationId:presentationID,
        resource:{
          requests
        }
      },(err,res)=>{
        if (err) {
          console.log(err);
          return;
        }
        console.log(res.data);
      })
    }
  catch (err) {
        console.error(err)
      }
  }
}
    
}