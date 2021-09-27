
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

module.exports = {
  listslide: listslides = () => {
    slide.presentations.get({
      presentationId: slideid,
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const length = res.data.slides.length;
      console.log('The presentation contains %s slides:', length);
      res.data.slides.map((slide, i) => {
        console.log(`- Slide #${i + 1} contains ${slide.pageElements.length} elements.`);
      });
    });
  },



  updatetext: updatetext = async () => {
    let pointname = 'รัฐวิชญ์  '
    let pointno = '1A1'
    var newIDs = ["copiedSlide_001", "copiedSlide_002", "copiedSlide_003"]
    const presentationID = '1F_8BpDtLQF5fiAd2RbL0NRg5YCh3zzPxbcedRrUazgI'
    const TemplateobjID = 'id.p'
    try {

      var requests = newIDs.map(function(id) {
        var obj = {};
        obj[TemplateobjID] = id;
        return {duplicateObject: {objectId: TemplateobjID, objectIds: obj}};
      });
       
       let result = await slide.presentations.batchUpdate({
          presentationId: presentationID,
          resource: {
            requests,
        } })
        return result
      }
  catch (err) {
        console.error(err)
      }
    }

    
}