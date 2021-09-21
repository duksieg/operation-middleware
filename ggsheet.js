
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { google } = require('googleapis');
const fs = require('fs');

const sheetID = "1FCJV5Flm1iAHVdSYfM7EPXtN_jdgO1tVPkUkGu-z568"
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


module.exports = {
    loadSheet: async function loadsheet() {
        let alldata
        try {
            await doc.useServiceAccountAuth(creds)
            await doc.loadInfo()
            let sheet = await doc.sheetsByTitle['ClassC']
            alldata = await sheet.getRows()

        } catch (err) {
            console.error(err)
        }
        return alldata
    },

    getimages:async function getimages(parentid,defaultid){
        if(parentid==null || parentid==undefined) parentid=defaultid 
        let result
        try {
            let resp = await drive.files.list({
                q: `'${parentid}' in parents` ,
                spaces: 'drive'
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
       
    },

    // get all datarow 
    getRowdata: async function getRowdata() {
        let arry = []
        try{
        let allrow = await this.loadSheet()
        for (let index = 0; index < allrow.length; index++) {
            let jobj = {
                pointno: allrow[index].no,
                idcard: allrow[index].idcard,
                coderank: allrow[index].code,
                fullname: allrow[index].fullname,
                latlng: allrow[index].LatLng,
                headname: allrow[index].headName,
                contactno: allrow[index].contactNo,
                status: allrow[index].status,
                beforereport: allrow[index].beforeReport,
                folderid: allrow[index].folderID,
                current: allrow[index].currentReport,
                afterreport: allrow[index].afterReport,
                normalgun: allrow[index].normalGuns,
                wargun: allrow[index].warGuns,
                thaicraftgun: allrow[index].thaicraftGuns,
                ammunition: allrow[index].ammunition,
                totalfound: allrow[index].totalFound,
                criminal:allrow[index].criminal,
                etc:allrow[index].etc
            }
            arry.push(jobj)
        }
        return arry
    }catch(err){
        console.error(err)
    }
    },

    createFolder: async function createFolder(foldername) {
       let folderId
       try{
        var fileMetadata = {
            'name': foldername,
            'parents': ['1eUFTGrp8VYI0vQNO75unrp6X7qyfcgTs'],
            'mimeType': 'application/vnd.google-apps.folder'
        };
       let res = await drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        })
        folderId = res.data.id
        this.updateFolderPermission(folderId)
        return folderId

       }catch(err){
            console.error(err)
           return false
       }
       
    },

    updateFolderPermission : async function updateFolderPermission(folderId){
        
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
                const result = await drive.files.get({
                    fileId: fileId,
                    fields: 'webViewLink, webContentLink',
                });
              console.log(result.data);
            } catch (error) {
              console.log(error.message);
            }
          
    },

    createimage: async function createImage(filename, filepath, mimetype,parentid) {
        try {
             await drive.files.create({
                requestBody: {
                    name: filename,
                    'parents': [parentid],
                },
                media: {
                    mimeType: mimetype,
                    body: fs.createReadStream(filepath),
                }
            });
            return true
        }
        catch (err) {
            console.error(err)
            return false
        }
    },

    sendimages : async function sendimages(placeid,status,files,folderId){

        if (files != null || files != undefined) {
            if (Array.isArray(files)) {
                for (let index = 0; index < files.length; index++) {
                    let filenametosend = placeid + "_" + status + "_" + files[index].name
                    let filepath = files[index].tempFilePath
                    this.createimage(filenametosend, filepath, files[index].mimetype,folderId)
                }
            } else {  //if not array = 1file
                let filenametosend = placeid + "_" + status + "_" + files.name
                let filepath = files.tempFilePath
                this.createimage(filenametosend, filepath, files.mimetype,folderId)
            }
        } else {
            return false
        }
    },

        updateRow: async function updateRow(record, files) {
            let timestamp = new Date().toLocaleDateString
            let result
            //placeid from post
            let placeid = record.placeid
            let status = record.status
            //load sheet for getindex in sheet
            let rows = await this.loadSheet()
            let rowIndex
            for (let index = 0; index < rows.length; index++) {
                if (rows[index].no == placeid) {
                    rowIndex = index
                }
            }
            this.sendimages(status,files)

            try {
                let folderId
                switch (status) {
                    case 'before':
                        folderId = rows[rowIndex].folderID
                        rows[rowIndex].status = record.status
                        rows[rowIndex].headName = record.name
                        rows[rowIndex].contactNo = record.tel
                        rows[rowIndex].beforeReport = record.reporttext
                        rows[rowIndex].timestamp = timestamp
                        //folderId =await this.createFolder(placeid)
                        this.sendimages(placeid,status,files,folderId)
                        break;
                    case 'current':
                        folderId = rows[rowIndex].folderID
                        rows[rowIndex].status = record.status
                        rows[rowIndex].currentReport = record.reporttext
                        rows[rowIndex].timestamp = timestamp
                        this.sendimages(placeid,status,files,folderId)
                        break;

                    case 'after':
                        folderId = rows[rowIndex].folderID
                        rows[rowIndex].status = record.status
                        rows[rowIndex].afterReport = record.reporttext
                        rows[rowIndex].normalGuns = record.normalguns
                        rows[rowIndex].warGuns = record.warguns
                        rows[rowIndex].thaicraftGuns = record.thaicraftguns
                        rows[rowIndex].ammunition = record.ammunition
                        rows[rowIndex].criminal = record.criminal
                        rows[rowIndex].etc  = record.etc
                        rows[rowIndex].timestamp = timestamp
                        this.sendimages(placeid,status,files,folderId)
                        break;

                }
                await rows[rowIndex].save();
                result = true
                return result
            } catch (err) {
                console.error('User input :' + placeid + 'get error' + err)
                return false
            }
        },

        gettotalData: async function getallrows() {

            let jsonstring
            try {
                let jsonobj = new Object();
                await doc.useServiceAccountAuth(creds)
                await doc.loadInfo()
                let sheet = await doc.sheetsByTitle['totaltable']
                await sheet.loadCells('A1:h2');
                //column 0 ยังไม่เข้า,1 ก่อนเข้า,2 ขณะเข้า,3 หลังเข้า,4 ปืนทั่วไป,5 ปืนสงคราม,6 ปืนไทยประดิษฐ์,7 ยุทธภัณฑ์
                jsonobj.all = sheet.getCell(1, 0).value
                jsonobj.before = sheet.getCell(1, 1).value
                jsonobj.current = sheet.getCell(1, 2).value
                jsonobj.after = sheet.getCell(1, 3).value
                jsonobj.normalgun = sheet.getCell(1, 4).value
                jsonobj.wargun = sheet.getCell(1, 5).value
                jsonobj.thaicraftgun = sheet.getCell(1, 6).value
                jsonobj.ammunition = sheet.getCell(1, 7).value
                jsonstring = JSON.stringify(jsonobj);

            } catch (err) {
                console.error(err)
            }
            return (jsonstring)
        }

    }



