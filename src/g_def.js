const { GoogleSpreadsheet } = require('google-spreadsheet');
const { google } = require('googleapis');
const https = require('https');
const sheetID = "1fHW3wcqe10UHBU-GbQOB56-jWXuvEtcf-_ftw18lqwA"
const doc = new GoogleSpreadsheet(sheetID);
var creds = require('./key.json');
const authcreds = new google.auth.GoogleAuth({
    keyFile: "./key.json", //the key file
    scopes: "https://www.googleapis.com/auth/drive",
});
const drive = google.drive({
    version: 'v3',
    auth: authcreds
});
const slide = google.slides({
    version: 'v1',
    auth: authcreds
  });
const presentationIDTemplate = '1rP3pPwSEpz9ZJBTgb4VF3kKvN1unzTeRf4XDuUH0YaE'
replacetemplate =(data, templateid,imgPerson,imgTr14,imgMap,imgHome,team) => {
    let requests = [{
      replaceAllText: {
        containsText: {
          text: '{{code}}',
          matchCase: true,
        },
        replaceText: data.code,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{fullname}}',
          matchCase: true,
        },
        replaceText: data.targetfullname,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{idno}}',
          matchCase: true,
        },
        replaceText: data.idno,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{chk_bf_casing}}',
          matchCase: true,
        },
        replaceText: data.chk_bf_casing,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{address-14}}',
          matchCase: true,
        },
        replaceText: `${data.address14} ${data.moo14} ${data.subdistrict14} ${data.district14} ${data.province14} ${data.zipcode14}`,
      },
    }, {
        replaceAllText: {
          containsText: {
            text: '{{latlng-14}}',
            matchCase: true,
          },
          replaceText: data.latlng14,
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{address-current}}',
            matchCase: true,
          },
          replaceText: `${data.addresscurrent} ${data.moocurrent} ${data.subdistrictcurrent} ${data.districtcurrent} ${data.provincecurrent} ${data.zipcodecurrent}`,
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{latlng-current}}',
            matchCase: true,
          },
          replaceText: data.latlngcurrent,
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{behavior}}',
            matchCase: true,
          },
          replaceText: data.behavior,
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{tel}}',
            matchCase: true,
          },
          replaceText: data.targettel,
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{line}}',
            matchCase: true,
          },
          replaceText: data.line,
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{facebook}}',
            matchCase: true,
          },
          replaceText: data.facebook,
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{instagram}}',
            matchCase: true,
          },
          replaceText: data.instagram,
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{twitter}}',
            matchCase: true,
          },
          replaceText: data.twitter,
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{fullname-investigator}}',
            matchCase: true,
          },
          replaceText: data.investigator,
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{investigator-tel}}',
            matchCase: true,
          },
          replaceText: data.investigatortel,
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{fullname-caser}}',
            matchCase: true,
          },
          replaceText: data.casingname,
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{caser-tel}}',
            matchCase: true,
          },
          replaceText: data.casingtel,
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{hn}}',
            matchCase: true,
          },
          replaceText: data.hanuman=="TRUE"? '/':'',
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{dr}}',
            matchCase: true,
          },
          replaceText: data.drone=="TRUE"? '/':'',
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{xry}}',
            matchCase: true,
          },
          replaceText: data.xry=="TRUE"? '/':'',
        },
      }, {
        replaceAllText: {
          containsText: {
            text: '{{pr}}',
            matchCase: true,
          },
          replaceText: data.pr=="TRUE"? '/':'',
        },
      }, {
      replaceAllShapesWithImage: {
        containsText: {
          text: '{{personal-image}}',
          matchCase: true,
        },
        imageUrl:imgPerson,//
        imageReplaceMethod: 'CENTER_INSIDE'
      }
    }, {
        replaceAllShapesWithImage: {
          containsText: {
            text: '{{personal-detail}}',
            matchCase: true,
          },
          imageUrl:imgTr14,
          imageReplaceMethod: 'CENTER_INSIDE'
        }
    }, {
      replaceAllShapesWithImage: {
        containsText: {
          text: '{{image-home}}',
          matchCase: true,
        },
        imageUrl:imgHome,
        imageReplaceMethod: 'CENTER_INSIDE'
      }
  }, {
    replaceAllShapesWithImage: {
      containsText: {
        text: '{{image-map}}',
        matchCase: true,
      },
      imageUrl:imgMap,
      imageReplaceMethod: 'CENTER_INSIDE'
    }
}, {
      replaceAllText: {
        containsText: {
          text: '{{car-detail}}',
          matchCase: true,
        },
        replaceText: data.car,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{motorcycle-detail}}',
          matchCase: true,
        },
        replaceText: data.motorcycle,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{casing-description}}',
          matchCase: true,
        },
        replaceText: data.moreinformation,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{reason}}',
          matchCase: true,
        },
        replaceText: data.reason,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{fd}}',
          matchCase: true,
        },
        replaceText: data.approved=="TRUE"? '/':'ไม่',
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{atk}}',
          matchCase: true,
        },
        replaceText: data.suggest_atk=="TRUE"? '/':'ไม่',
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{casing_date}}',
          matchCase: true,
        },
        replaceText: data.date_casing,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{fullname-header}}',
          matchCase: true,
        },
        replaceText: team.header_name,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{pos-header}}',
          matchCase: true,
        },
        replaceText: team.header_position,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{tel-header}}',
          matchCase: true,
        },
        replaceText: team.header_tel,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{fullname-reporter}}',
          matchCase: true,
        },
        replaceText: team.reporter_name,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{pos-reporter}}',
          matchCase: true,
        },
        replaceText: team.reporter_position,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{tel-reporter}}',
          matchCase: true,
        },
        replaceText: team.reporter_tel,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{fullname-photographer}}',
          matchCase: true,
        },
        replaceText: team.photographer_name,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{pos-photographer}}',
          matchCase: true,
        },
        replaceText: team.photographer_position,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{tel-photographer}}',
          matchCase: true,
        },
        replaceText: team.photographer_tel,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{fullname-pointer}}',
          matchCase: true,
        },
        replaceText: team.pointer_name,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{pos-pointer}}',
          matchCase: true,
        },
        replaceText: team.pointer_position,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{tel-pointer}}',
          matchCase: true,
        },
        replaceText: team.pointer_tel,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{fullname-tm1}}',
          matchCase: true,
        },
        replaceText: team.op1_name,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{pos-tm1}}',
          matchCase: true,
        },
        replaceText: team.op1_position,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{tel-tm1}}',
          matchCase: true,
        },
        replaceText: team.op1_tel,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{fullname-tm2}}',
          matchCase: true,
        },
        replaceText: team.op2_name,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{pos-tm2}}',
          matchCase: true,
        },
        replaceText: team.op2_position,
      },
    }, {
      replaceAllText: {
        containsText: {
          text: '{{tel-tm2}}',
          matchCase: true,
        },
        replaceText: team.op2_tel,
      },
    }
    ]

    res=slide.presentations.batchUpdate({
      presentationId: templateid,
      resource: {
        requests,
      },
    })
    return res.data
  }
listslides = () => {
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
  }
deleteobj=async (presentId,objId)=>{
    let requests =[{
        deleteObject: {
            objectId: objId
          }
        
      }]
    res=await slide.presentations.batchUpdate({
        presentationId: presentId,
        resource: {
          requests,
        },
      })
      return res

}
replaceimg= async (presentId,idslide,keyword,urlimg) =>{
    let requests = [
        {
          replaceAllShapesWithImage: {
            containsText: {
              text: keyword,//'{{image-map}}'
              matchCase: true,
            },
            pageObjectIds: [idslide],
            imageUrl:urlimg.replace("s220","s640"),//'https://lh3.googleusercontent.com/0wGfll5DqJWQeeDom3Ocof2EvU3Aye3Vfy_QULwjgDg53oXxrg6hjJ5TV2QxT1h67vzmiWZXXRpxe5Q=s640'
            imageReplaceMethod: 'CENTER_INSIDE',
          }
        
        }
      ]
    rescopy=await slide.presentations.batchUpdate({
        presentationId: presentId,
        resource: {
          requests,
        },
      })
      return rescopy.data.replies[0]

}
copyslide= async (idpresent,target) => {
    switch (target) {
      case 'maptohome':
        srcslide='gfb4bf4b491_0_131'
        break;
      case 'imagehome':
        srcslide='gfb4bf4b491_0_136'
        break;
      case 'imagemobile':
        srcslide='gfb4bf4b491_0_141'
        break;
      case 'imageetc':
        srcslide='gfccf8fa434_0_9'
        break;
      default:
        break;
    }
    let requests = [
        {
          duplicateObject: {
            objectId: srcslide

          }

        
        }
      ]
    rescopy=await slide.presentations.batchUpdate({
        presentationId: idpresent,
        resource: {
          requests,
        },
      })
      return [rescopy.data.replies[0].duplicateObject.objectId,srcslide]
}
dupslide = async (desfolderId,desfileName) => {

    //set filename
    let request = {
      name: desfileName,
      parents: [desfolderId]
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

  }
listfile=async (parentid)=> {
    //'15C-k4rJt4NOsbiekAFJ8bf40ZQ5bdt_A'
    try {
        let resp = await drive.files.list({
            q: `'${parentid}' in parents`,
            spaces: 'drive',
            fields:'files(id,name,mimeType,webContentLink,thumbnailLink)'//id, name,mimeType,webContentLink,thumbnailLink
        })
        result = resp.data.files
        return result
    }
    catch (err) {
        console.error(err)
        return false
    }

}

listfileinFolder = async (code)=>{
  let folderpath = path.join(folderdata,code)
  let arryfile = []
  let files = await fs.readdirSync(folderpath)
  files.forEach(file => {
      // let file_path = path.join(folderpath,file)
      arryfile.push({'name':file,'thumbnailLink':`https://gunman.csd.go.th/buck/${code}/${file}`})
  })
  return arryfile
}

listfile_from_shooter=async (code)=> {
  //'15C-k4rJt4NOsbiekAFJ8bf40ZQ5bdt_A'

  box=[]
  await https.get(`https://gunman.csd.go.th/listfile/${code}`, res => {
  let data = [];
  const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
  console.log('Status Code:', res.statusCode);
  console.log('Date in Response header:', headerDate);

  res.on('data', chunk => {
    data.push(chunk);
  });

  res.on('end', () => {
    console.log('Response ended: ');
    const content = JSON.parse(Buffer.concat(data).toString());
    console.log(content)
    box.push(content)
    // for(user of users) {
    //   console.log(`Got user with id: ${user.id}, name: ${user.name}`);
    // }
  });

}).on('error', err => {
  console.log('Error: ', err.message);
});
return box
}
//   try {
//         let resp = await https://gunman.csd.go.th/listfile/1c2
//       let resp = await drive.files.list({
//           q: `'${parentid}' in parents`,
//           spaces: 'drive',
//           fields:'files(id,name,mimeType,webContentLink,thumbnailLink)'//id, name,mimeType,webContentLink,thumbnailLink
//       })
//       result = resp.data.files
//       return result
//   }
//   catch (err) {
//       console.error(err)
//       return false
//   }

// }
getspc_img=(check_img,keyword)=>{
    let arr=[]
    for (let i in check_img) {
        if (check_img.hasOwnProperty.call(check_img, i)) {
            let element = check_img[i];
            if (element.name.search(keyword) !=-1){
                arr.push(element)
                console.log(element.name)
            }  
        }
    }
    return arr
}
getspc_mime=(fileArr,mime='application/vnd.google-apps.presentation')=>{
    let arr=[]
    //application/vnd.google-apps.presentation
    for (let i in fileArr) {
        if (fileArr.hasOwnProperty.call(fileArr, i)) {
            let element = fileArr[i];
            if (element.mimeType==mime){
                arr.push(element)
                console.log(element.name)


            }  
        }
    }
    return arr
}
loadsheet= async (sheetname)=> {
    let alldata
    try {
        await doc.useServiceAccountAuth(creds)
        await doc.loadInfo()
        let sheet = await doc.sheetsByTitle[sheetname]
        alldata = await sheet.getRows()
    } catch (err) {
        console.error(err)
    }
    return alldata
}
update_cell= async (sheet,content,row,col)=>{


  cell_folderLink = sheet.getCell(row, col);
  cell_folderLink.value=content;

}
updateFolderPermission= async (folderId)=> {

  try {
      const fileId = folderId;
      //change file permisions to public.
      await drive.permissions.create({
          fileId: fileId,
          requestBody: {
              role: 'reader',
              type: 'anyone',
          },
      });

      //obtain the webview and webcontent links
         result = await drive.files.get({
          fileId: fileId,
          fields: 'webViewLink, webContentLink',
      });
      return result.data.webViewLink
  } catch (error) {
      return (error);
  }

}
loadsheet_casing= async ()=> {
  let sheetcasingID = "1eupcaKYaxFX7T0zoFo9zUogkFvtTsQWFR3sNuXQFBfM"
  let doc_casing = new GoogleSpreadsheet(sheetcasingID);
  let alldata,sheet
  try {
      await doc_casing.useServiceAccountAuth(creds)
      await doc_casing.loadInfo()
      sheet = await doc_casing.sheetsByTitle['103 เป้า']
      alldata = await sheet.getRows()
  } catch (err) {
      console.error(err)
  }
  return [alldata,sheet]
}
getfolderid= async (IDdetect)=>{
    let parentid = '1fL0qQ7Kb4BV2R3UaQVtROqBiNsOhwHll'
    let result
    try {
        let resp = await drive.files.list({
            q: `'${parentid}' in parents and name contains '${IDdetect}'`,
            mimeType:'application/vnd.google-apps.folder',
            spaces: 'drive',
        })
        // resp.data.files.forEach(element => {
        //     console.log(element)
        // });
        result = resp.data.files
        return result
    }
    catch (err) {
        console.error(err)
        return false
    }


}
createFolder=async(pointname,rowindex)=> {
    try {
        var fileMetadata = {
            'name': pointname,
            'parents': ['1fL0qQ7Kb4BV2R3UaQVtROqBiNsOhwHll'],
            'mimeType': 'application/vnd.google-apps.folder'
        };
        let res = await drive.files.create({
            resource: fileMetadata,
            fields: 'id,webViewLink'
        })
       let  folderId = res.data.id
        // let folderlink = res.data.webViewLink
        // let folderlink = await updateFolderPermission(folderId).data.webViewLink
          // await this.updateRowfolderID(folderlink,rowindex)
        
        return folderId

    } catch (err) {
        console.error(err)
        return false
    }

    
}
module.exports ={listfileinFolder,listslides,getspc_img,getspc_mime,dupslide,copyslide,replaceimg,deleteobj,loadsheet,getfolderid,listfile,createFolder,loadsheet_casing,update_cell,updateFolderPermission}

//{'header':{'name':'sdfsdg sdfgdsf','pos':'inspector','tel':'08012345687'},'reporter':{'name':'sdfsdg sdfgdsf','pos':'inspector','tel':'08012345687'},'photographer':{'name':'sdfsdg sdfgdsf','pos':'inspector','tel':'08012345687'},'pointer':{'name':'sdfsdg sdfgdsf','pos':'inspector','tel':'08012345687'},'tm1':{'name':'sdfsdg sdfgdsf','pos':'inspector','tel':'08012345687'},'tm2':{'name':'sdfsdg sdfgdsf','pos':'inspector','tel':'08012345687'}}
// requests=[{
//   replaceAllText: {
//     containsText: {
//       text: '{{fullname-header}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard,
//   },
// }, {
//   replaceAllText: {
//     containsText: {
//       text: '{{pos-header}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard,
//   },
// }, {
//   replaceAllText: {
//     containsText: {
//       text: '{{tel-header}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard,
//   },
// }, {
//   replaceAllText: {
//     containsText: {
//       text: '{{fullname-reporter}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard,
//   },
// }, {
//   replaceAllText: {
//     containsText: {
//       text: '{{pos-reporter}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard,
//   },
// }, {
//   replaceAllText: {
//     containsText: {
//       text: '{{tel-reporter}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard,
//   },
// }, {
//   replaceAllText: {
//     containsText: {
//       text: '{{fullname-photographer}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard
//   }
// },{
//     replaceAllText: {
//       containsText: {
//         text: '{{pos-photographer}}',
//         matchCase: true,
//       },
//       replaceText: personal.idcard
//   }
// },{
//       replaceAllText: {
//         containsText: {
//           text: '{{tel-photographer}}',
//           matchCase: true,
//         },
//         replaceText: personal.idcard
//   }
// },{
//   replaceAllText: {
//     containsText: {
//       text: '{{fullname-pointer}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard
// }
// },{
//   replaceAllText: {
//     containsText: {
//       text: '{{pos-pointer}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard
// }
// },{
//   replaceAllText: {
//     containsText: {
//       text: '{{fullname-tm1}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard
// }
// },{
//   replaceAllText: {
//     containsText: {
//       text: '{{pos-tm1}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard
// }
// },{
//   replaceAllText: {
//     containsText: {
//       text: '{{tel-tm1}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard
// }
// },{
//   replaceAllText: {
//     containsText: {
//       text: '{{fullname-tm2}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard
// }
// },{
//   replaceAllText: {
//     containsText: {
//       text: '{{pos-tm2}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard
// }
// },{
//   replaceAllText: {
//     containsText: {
//       text: '{{tel-tm2}}',
//       matchCase: true,
//     },
//     replaceText: personal.idcard
// }
// }
// ]