
const { google } = require('googleapis');
const slideid ='1F_8BpDtLQF5fiAd2RbL0NRg5YCh3zzPxbcedRrUazgI'

const authcreds = new google.auth.GoogleAuth({
    keyFile: "./key.json", //the key file
    scopes: "https://www.googleapis.com/auth/presentations.readonly",
});

const slide = google.slides ({
    version: 'v1',
    auth: authcreds
});

module.exports = {
 listslide: listslides =()=>{
    slide.presentations.get({
        presentationId:slideid,
      }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const length = res.data.slides.length;
        console.log('The presentation contains %s slides:', length);
        res.data.slides.map((slide, i) => {
          console.log(`- Slide #${i + 1} contains ${slide.pageElements.length} elements.`);
        });
      });
    },



    updatetext: updatetext=()=>{
        let name = 'รัฐวิชญ์  '
        let pointno = '1A1'
        this.driveService.files.copy({
            fileId: templatePresentationId,
            requests,
          }, (err, driveResponse) => {
        let presentationCopyId = driveResponse.id;
            // Create the text merge (replaceAllText) requests for this presentation.
            let requests = [{
              replaceAllText: {
                containsText: {
                  text: '{{customer-name}}',
                  matchCase: true,
                },
                replaceText: customerName,
              },
            }]
    })
  }

    
}