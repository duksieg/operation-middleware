
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { google } = require('googleapis');
const fs = require('fs');
const { readdir } = require('fs/promises')

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

    // get all datarow 
    getRowdata: async function getRowdata() {
        let arry = []
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
                beforefolder: allrow[index].beforefolder,
                current: allrow[index].currentReport,
                currentfolder: allrow[index].currentFolder,
                afterreport: allrow[index].afterReport,
                afterfolder: allrow[index].afterfolder,
                normalgun: allrow[index].normalGuns,
                wargun: allrow[index].warGuns,
                thaicraftgun: allrow[index].thaicraftGuns,
                ammunition: allrow[index].ammunition,
                totalfound: allrow[index].totalFound
            }
            arry.push(jobj)
        }
        return arry
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
        return folderId

       }catch(err){
            console.error(err)
           return false
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
                        rows[rowIndex].status = record.status
                        rows[rowIndex].headName = record.name
                        rows[rowIndex].contactNo = record.tel
                        rows[rowIndex].beforeReport = record.reporttext
                        folderId =await this.createFolder(placeid)
                        if(folderId){
                            this.sendimages(placeid,status,files,folderId)
                        rows[rowIndex].folderID = folderId
                        }else{
                            console.error('something wrong')
                        }
                        
                        break;
                    case 'current':
                        folderId = rows[rowIndex].folderID
                        rows[rowIndex].status = record.status
                        rows[rowIndex].currentReport = record.reporttext
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



