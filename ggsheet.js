
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { google } = require('googleapis');
const fs = require('fs');
const linesender = require('./linenoti')
const sheetID = "189Fl1bnbuZNUESOu6juk0YyF6ZtE3y0APK2ullhAwj4"
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
            let sheet = await doc.sheetsByTitle['narai']
            alldata = await sheet.getRows()
        } catch (err) {
            console.error(err)
        }
        return alldata
    },

    getfileid: async function getfileid(IDdetect){
        let parentid = '14IKnpv20XhDsKl4UTJqhm3mEjqRxH4Ik'
        let result
        try {
            let resp = await drive.files.list({
                q: `'${parentid}' in parents and name contains '${IDdetect}'`,
                mimeType:'image/jpeg,image/png',
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
    getfolderid: async function getfolderid(IDdetect){
        let parentid = '1jPdMgxWSH3FZzHALEAEjY5KtgJu0fEid'
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


    },
    



    getimages: async function getimages(parentid, defaultid) {
        if (parentid == null || parentid == undefined) parentid = defaultid
        let result
        try {
            let resp = await drive.files.list({
                q: `'${parentid}' in parents`,
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
        try {
            let allrow = await this.loadSheet()
            for (let index = 0; index < allrow.length; index++) {
                let jobj = {
                    pointno: allrow[index].IDdetect,
                    idcard: allrow[index].idcard,
                    coderank: allrow[index].code,
                    fullname: allrow[index].fullname,
                    pointlatlng: allrow[index].LatLng,
                    headname: allrow[index].headName,
                    contactno: allrow[index].contactNo,
                    status: allrow[index].status,
                    folderid: allrow[index].folderID,
                    criminalimage:allrow[index].criminalimage,
                    normalgun: allrow[index].normalGuns,
                    wargun: allrow[index].warGuns,
                    thaicraftgun: allrow[index].thaicraftGuns,
                    ammunition: allrow[index].ammunition,
                    totalfound: allrow[index].totalFound,
                    criminal: allrow[index].criminal,
                    specialcase:allrow[index].specialcase,
                    etc: allrow[index].etc,
                    dv: allrow[index].dv
                }
                if(allrow[index].IDdetect !=null ) arry.push(jobj)
            }
            return arry
        } catch (err) {
            console.error(err)
        }
    },

    createFolder: async function createFolder(pointname,rowindex) {
        try {
            var fileMetadata = {
                'name': pointname,
                'parents': ['1HILztWrd42JypUEtXGqr8lNtbeYXbvb1'],
                'mimeType': 'application/vnd.google-apps.folder'
            };
            let res = await drive.files.create({
                resource: fileMetadata,
                fields: 'id,webViewLink'
            })
           let  folderId = res.data.id
            let folderlink = res.data.webViewLink
             await this.updateFolderPermission(folderId)
             await this.updateRowfolderID(folderlink,rowindex)
            
            return folderlink

        } catch (err) {
            console.error(err)
            return false
        }

    },

    updateFolderPermission: async function updateFolderPermission(folderId) {

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
            return(result);
        } catch (error) {
            return (error);
        }

    },

    createimage: async function createImage(filename, filepath, mimetype, parentid) {
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

    sendimages: async function sendimages(placeid, status, files, folderId) {

        if (files != null || files != undefined) {
            if (Array.isArray(files)) {
                for (let index = 0; index < files.length; index++) {
                    let filenametosend = placeid + "_" + status + "_" + files[index].name
                    let filepath = files[index].tempFilePath
                    this.createimage(filenametosend, filepath, files[index].mimetype, folderId)
                }
            } else {  //if not array = 1file
                let filenametosend = placeid + "_" + status + "_" + files.name
                let filepath = files.tempFilePath
                this.createimage(filenametosend, filepath, files.mimetype, folderId)
            }
        } else {
            return false
        }
    },

    updateRowfolderID: async function updateRowfolderID(linkfolderid,pointname){
        
        try{
            let rows = await this.loadSheet()
            rows[rowindex].folderID = linkfolderid
            await rows[rowindex].save();
        return true
    }catch(err){
        console.error(err)
    }
    },


    updateRow: async function updateRow(record, files) {
        let date = new Date().toLocaleDateString("th-TH" ,{ timeZone: 'Asia/Bangkok' })
        let time = new Date().toLocaleTimeString("th-TH" ,{ timeZone: 'Asia/Bangkok' })
        let timestamp = date+" "+time
        let result,linemessage
        //placeid from post
        let placeid = record.placeid
        let headname = record.name.toString().replace(' ','')
        let status = record.status
        //load sheet for getindex in sheet
        let rows = await this.loadSheet()
        let rowIndex
        for (let index = 0; index < rows.length; index++) {
            if (rows[index].IDdetect == placeid) {
                rowIndex = index
            }
        }
        let systemcheckname = rows[rowIndex].headName.toString().replace(' ','')
        let systemcheckid = rows[rowIndex].IDdetect.toString().replace(' ','').toLocaleLowerCase()
        let checkIDdetect = placeid.toString().trim().toLocaleLowerCase()

        const collator = new Intl.Collator('th');
        const order = collator.compare(systemcheckname,headname);
        if ((order==0) && (checkIDdetect == systemcheckid )) {
            this.sendimages(status, files)
            let normal=0
            let war=0
            let thaicraft =0
            let ammunition =0 
            let total = 0
            try {
                let folderId = rows[rowIndex].folderID
               folderId = folderId.replace('https://drive.google.com/drive/folders/','')
                switch (status) {
                    case 'before':
                        rows[rowIndex].status = record.status
                        rows[rowIndex].timestamp = timestamp
                        rows[rowIndex].specialcase = record.specialcase
                        linemessage=`\n\nจุดเข้าค้นที่ ${record.placeid}\nสถานะ: ก่อนเข้าค้น \n\nหน.ชุดปฏิบัติ:\n${record.name}\nเบอร์โทร:${rows[rowIndex].contactNo}\n\nวัน/เวลาขณะส่งข้อมูล:\n${timestamp}\n\nภาพถ่ายประกอบการรายงาน:กุเกิ้ลไดร์ฟโฟลเดอร์} `
                        this.sendimages(placeid, status, files, folderId)
                        break;
                    case 'current':
                         normal = parseInt(record.normalguns)
                         war = parseInt(record.warguns)
                         thaicraft = parseInt(record.thaicraftguns)
                         ammunition = parseInt(record.ammunition)
                         total = normal+war+thaicraft+ammunition
                         console.log('total :'+total+ ',normal :'+normal+',war :'+war+',thaicraft : '+thaicraft+',ammution :'+ammunition)
                        rows[rowIndex].status = record.status
                        rows[rowIndex].normalGuns = record.normalguns
                        rows[rowIndex].warGuns = record.warguns
                        rows[rowIndex].thaicraftGuns = record.thaicraftguns
                        rows[rowIndex].ammunition = record.ammunition
                        rows[rowIndex].criminal = record.criminal
                        rows[rowIndex].etc = record.etc
                        rows[rowIndex].timestamp = timestamp
                        rows[rowIndex].specialcase = record.specialcase
                        rows[rowIndex].totalFound = total
                        linemessage=`\n\nจุดเข้าค้นที่ ${record.placeid}\nสถานะ: ขณะเข้าค้น \n\nหน.ชุดปฏิบัติ:\n${record.name}\nเบอร์โทร:${rows[rowIndex].contactNo}\n\nวัน/เวลาขณะส่งข้อมูล:\n${timestamp}\n\nพบของกลาง:\nอาวุธปืนทั่วไป:${record.normalguns}\nอาวุธปืนสงคราม:${record.warguns}\nอาวุธปืนไทยประดิษฐ์:${record.thaicraftguns}\nเครื่องยุทธภัณฑ์:${record.ammunition}\nอื่นๆ:${record.etc}\n\nภาพถ่ายประกอบการรายงาน:กุเกิ้ลไดร์ฟโฟลเดอร์}`
                        this.sendimages(placeid, status, files, folderId)
                        break;

                    case 'after':
                         normal = parseInt(record.normalguns)
                         war = parseInt(record.warguns)
                        thaicraft = parseInt(record.thaicraftguns)
                        ammunition = parseInt(record.ammunition)
                        total = normal+war+thaicraft+ammunition
                        console.log('total :'+total+ ',normal :'+normal+',war :'+war+',thaicraft : '+thaicraft+',ammution :'+ammunition)
                        rows[rowIndex].status = record.status
                        rows[rowIndex].normalGuns = record.normalguns
                        rows[rowIndex].warGuns = record.warguns
                        rows[rowIndex].thaicraftGuns = record.thaicraftguns
                        rows[rowIndex].ammunition = record.ammunition
                        rows[rowIndex].criminal = record.criminal
                        rows[rowIndex].etc = record.etc
                        rows[rowIndex].timestamp = timestamp
                        rows[rowIndex].specialcase = record.specialcase
                        rows[rowIndex].totalFound = total
                        linemessage=`\n\nจุดเข้าค้นที่ ${record.placeid}\nสถานะ: หลังเข้าค้น \n\nหน.ชุดปฏิบัติ:\n${record.name}\nเบอร์โทร:${rows[rowIndex].contactNo}\n\nวัน/เวลาขณะส่งข้อมูล:\n${timestamp}\n\nพบของกลาง:\nอาวุธปืนทั่วไป:${record.normalguns}\nอาวุธปืนสงคราม:${record.warguns}\nอาวุธปืนไทยประดิษฐ์:${record.thaicraftguns}\nเครื่องยุทธภัณฑ์:${record.ammunition}\nอื่นๆ:${record.etc}\n\nภาพถ่ายประกอบการรายงาน:กุเกิ้ลไดร์ฟโฟลเดอร์}`
                        this.sendimages(placeid, status, files, folderId)
                        break;

                }
                await rows[rowIndex].save();
                result = true
                if(result){
                    let jsonData = {
                        message: linemessage,
                      }
                // let response = await linesender.linenoti(jsonData,placeid)
                }
                return result
            } catch (err) {
                console.error('User input :' + placeid + 'get error' + err)
                let reserr = "รหัสจุดค้นที่ : " + placeid + " reason : " + err
                return reserr
            }
        } else {
            console.log('User input:'+headname+" รหัสเป้า :"+placeid)
            console.log('System :'+systemcheckname+" รหัสเป้า :"+rows[rowIndex].IDdetect)
            return 'notmatch'
        }
    },

    gettotalData: async function getallrows() {

        let jsonstring
        try {
            let jsonobj = new Object();
            await doc.useServiceAccountAuth(creds)
            await doc.loadInfo()
            let sheet = await doc.sheetsByTitle['totaltable']
            await sheet.loadCells('A1:X2');
            //column 0 ยอดเป้าทั้งหมด,1 ยังไม่เข้า,2 ก่อนเข้า,3 ขณะเข้า,4 หลังเข้า,5 จำนวนผู้ต้องหา ,6 ปืนทั่วไป,7 ปืนสงคราม,8 ปืนไทยประดิษฐ์,9 ยุทธภัณฑ์,10 ยอดรวมทั้งหมด
            jsonobj.all = sheet.getCell(1, 0).value
            jsonobj.notchecked = sheet.getCell(1, 1).value
            jsonobj.before = sheet.getCell(1, 2).value
            jsonobj.current = sheet.getCell(1, 3).value
            jsonobj.after = sheet.getCell(1, 4).value
            jsonobj.criminal = sheet.getCell(1,5).value
            jsonobj.normalgun = sheet.getCell(1, 6).value
            jsonobj.wargun = sheet.getCell(1, 7).value
            jsonobj.thaicraftgun = sheet.getCell(1, 8).value
            jsonobj.ammunition = sheet.getCell(1, 9).value
            jsonobj.total = sheet.getCell(1, 10).value
            jsonstring = JSON.stringify(jsonobj);

        } catch (err) {
            console.error(err)
        }
        return (jsonstring)
    },
    

}



