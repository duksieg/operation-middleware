
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

const presentationIDTemplate = '1sbZZ-yakfuIdMzTxyswjaOvl5-k5jo7FqpbWdi8HOGs'

module.exports = {

  listslide: listslides = () => {
    slide.presentations.get({
      presentationId: presentationIDTemplate,
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const length = res.data.slides.length;
      console.log('The presentation contains %s slides:', length);
      res.data.slides.map((slide, i) => {
        console.log(slide.pageElements[0]);
      });
    });
  },


  replacetemplate: replacetemplate =(personal, templateid) => {
    let requests = [{
      replaceAllText: {
        containsText: {
          text: '{{address}}',
          matchCase: true,
        },
        replaceText: personal.pointlatlng,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{fullname}}',
          matchCase: true,
        },
        replaceText: personal.fullname,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{idno}}',
          matchCase: true,
        },
        replaceText: personal.idcard,
      },
    }, {
      replaceAllShapesWithImage: {
        containsText: {
          text: '{{personal-image}}',
          matchCase: true,
        },
        imageUrl:'https://drive.google.com/uc?id='+personal.criminalimage,
        imageReplaceMethod: 'CENTER_INSIDE',
      }
    }]

    slide.presentations.batchUpdate({
      presentationId: templateid,
      resource: {
        requests,
      },
    }, (err, batchUpdateResponse) => {
      if (err) console.error(err)
      let result = batchUpdateResponse;
      return result
    })
  },

  
  dupslide: dupslide = async (personal) => {

    //set filename
    let request = {
      name: personal.pointno,
    };

    //copy slide
    try {
      let driverespond = await drive.files.copy({
        fileId: presentationIDTemplate,
        resource: request
      })
        return templateid = driverespond.data.id
    }catch(err){
      console.error(err)
    }

  },

}