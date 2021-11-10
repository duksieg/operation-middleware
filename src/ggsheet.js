
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { google } = require('googleapis');
const fs = require('fs');
const linesender = require('./linenoti')
var creds = require('./key.json');

const authcreds = new google.auth.GoogleAuth({
    keyFile: "./key.json", //the key file
    scopes: "https://www.googleapis.com/auth/drive",
});

const drive = google.drive({
    version: 'v3',
    auth: authcreds
});

const sheetID = "1fHW3wcqe10UHBU-GbQOB56-jWXuvEtcf-_ftw18lqwA"
const doc = new GoogleSpreadsheet(sheetID);


module.exports = {

    loadSheet: async function loadSheet(sheetname) {
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
    },

    //load team
    loadTeam: async function loadteam() {

    },

    loadpoint: async function loadpoint() {
        let code = []
        let headteam = []

        try {
            let teaminform = await this.loadSheet('team')
            for (let index = 0; index < teaminform.length; index++) {
                const element = teaminform[index];
                if (!code.includes(element.code) && (element.code != undefined)) {
                    code.push(element.code)
                }
                if (!headteam.includes(element.header_name) && (element.header_name!=undefined)) {
                    headteam.push(element.header_name)
                }
            }
        } catch (err) {
            console.error(err)
        }

        let obj = {
            'code': code,
            'headteam': headteam
        };
        return obj
    },

    // get all datarow 
    getRowdata: async function getRowdata() {
        let arry = []
        try {
            let allrow = await this.loadSheet()
            for (let index = 0; index < allrow.length; index++) {
                let jobj = {
                    pointno: allrow[index].code,
                    idcard: allrow[index].idcard,
                    coderank: allrow[index].code,
                    fullname: allrow[index].fullname,
                    pointlatlng: allrow[index].LatLng,
                    headname: allrow[index].headName,
                    contactno: allrow[index].contactNo,
                    status: allrow[index].status,
                    folderid: allrow[index].folderID,
                    criminalimage: allrow[index].criminalimage,
                    normalgun: allrow[index].normalGuns,
                    wargun: allrow[index].warGuns,
                    thaicraftgun: allrow[index].thaicraftGuns,
                    ammunition: allrow[index].ammunition,
                    totalfound: allrow[index].totalFound,
                    criminal: allrow[index].criminal,
                    specialcase: allrow[index].specialcase,
                    etc: allrow[index].etc,
                    dv: allrow[index].dv
                }
                if (allrow[index].code != null) arry.push(jobj)
            }
            return arry
        } catch (err) {
            console.error(err)
        }
    },

    //get casing by row
    getMainbyCode: async function getMainbyCode(code) {
        try {
            let rows = await this.loadSheet('casing')
            let rowIndex
            for (let index = 0; index < rows.length; index++) {
                if (rows[index].code == code) {
                    rowIndex = index
                }
            }
            return rows[rowIndex]
        } catch (err) {
            console.error(err)
        }
    },

    //get team by row
    getTeambyCode: async function getTeambyCode(code) {
        try {
            let rows = await this.loadSheet('casing')
            let rowIndex
            for (let index = 0; index < rows.length; index++) {
                if (rows[index].code == code) {
                    rowIndex = index
                }
            }
            return rows[rowIndex]
        } catch (err) {
            console.error(err)
        }
    },


    updateTeamName: async function updateTeamName(formdata, code) {
        let result = false
        try {
            let rows = await this.loadSheet('team')
            let rowIndex
            for (let index = 0; index < rows.length; index++) {
                if (rows[index].code == code) {
                    rowIndex = index
                }
            }
            rows[rowIndex].header_name = formdata.header_name
            rows[rowIndex].header_position = formdata.header_position
            rows[rowIndex].header_tel = formdata.header_tel
            rows[rowIndex].reporter_name = formdata.reporter_name
            rows[rowIndex].reporter_position = formdata.reporter_position
            rows[rowIndex].reporter_tel = formdata.reporter_tel
            rows[rowIndex].photographer_name = formdata.photographer_name
            rows[rowIndex].photographer_position = formdata.photographer_position
            rows[rowIndex].photographer_tel = formdata.photographer_tel
            rows[rowIndex].pointer_name = formdata.pointer_name
            rows[rowIndex].pointer_position = formdata.pointer_position
            rows[rowIndex].pointer_tel = formdata.pointer_tel
            rows[rowIndex].op1_name = formdata.op1_name
            rows[rowIndex].op1_position = formdata.op1_position
            rows[rowIndex].op1_tel = formdata.op1_tel
            rows[rowIndex].op2_name = formdata.op2_name
            rows[rowIndex].op2_position = formdata.op2_position
            rows[rowIndex].op2_tel = formdata.op2_tel
            await rows[rowIndex].save();
            result = true
        } catch (err) {
            console.error(err)
        }
        return result
    },

    updateCasingRow: async function updateCasingRow(formdata) {
        let date = new Date().toLocaleDateString("th-TH", { timeZone: 'Asia/Bangkok' })
        let time = new Date().toLocaleTimeString("th-TH", { timeZone: 'Asia/Bangkok' })
        try {
            let result
            let teamupdated = null
            let rows = await this.loadSheet('casing')
            let code = formdata.code
            let rowIndex
            for (let index = 0; index < rows.length; index++) {
                if (rows[index].code == code) {
                    rowIndex = index
                }
            }
            //set value
            if (formdata.istargetfounded != '') rows[rowIndex].istargetfounded = formdata.istargetfounded
            if (formdata.targetfullname != '') rows[rowIndex].targetfullname = formdata.targetname
            if (formdata.targetid != '') rows[rowIndex].idno = formdata.targetid
            if (formdata.targettel != '') rows[rowIndex].targettel = formdata.targettel
            if (formdata.behavior != '') rows[rowIndex].behavior = formdata.behavior
            if (formdata.address14 != '') rows[rowIndex].address14 = formdata.address14
            if (formdata.moo14 != '') rows[rowIndex].moo14 = formdata.moo14
            if (formdata.subdistrict14 != '') rows[rowIndex].subdistrict14 = formdata.subdistrict14
            if (formdata.district14 != '') rows[rowIndex].district14 = formdata.district14
            if (formdata.province14 != '') rows[rowIndex].province14 = formdata.province14
            if (formdata.zipcode14 != '') rows[rowIndex].zipcode14 = formdata.zipcode14
            if (formdata.latlng14 != '') rows[rowIndex].latlng14 = formdata.latlng14
            if (formdata.addresscurrent != '') rows[rowIndex].addresscurrent = formdata.addresscurrent
            if (formdata.moocurrent != '') rows[rowIndex].moocurrent = formdata.moocurrent
            if (formdata.subdistrictcurrent != '') rows[rowIndex].subdistrictcurrent = formdata.subdistrictcurrent
            if (formdata.districtcurrent != '') rows[rowIndex].districtcurrent = formdata.districtcurrent
            if (formdata.provincecurrent != '') rows[rowIndex].provincecurrent = formdata.provincecurrent
            if (formdata.zipcodecurrent != '') rows[rowIndex].zipcodecurrent = formdata.zipcodecurrent
            if (formdata.latlngcurrent != '') rows[rowIndex].latlngcurrent = formdata.latlngcurrent
            if (formdata.facebooktarget != '') rows[rowIndex].facebook = formdata.facebooktarget
            if (formdata.instagramtarget != '') rows[rowIndex].instagram = formdata.instagramtarget
            if (formdata.linetarget != '') rows[rowIndex].line = formdata.linetarget
            if (formdata.twittertarget != '') rows[rowIndex].twitter = formdata.twittertarget
            if (formdata.casingname != '') rows[rowIndex].casingname = formdata.casingname
            if (formdata.casingtel != '') rows[rowIndex].casingtel = formdata.casingtel
            if (formdata.car != '') rows[rowIndex].car = formdata.car
            if (formdata.motorcycle != '') rows[rowIndex].motorcycle = formdata.motorcycle
            if (formdata.moreinformation != '') rows[rowIndex].moreinformation = formdata.moreinformation
            if (formdata.requiredstuff != '') rows[rowIndex].requiredstuff = formdata.requiredstuff
            if (formdata.reason != '') rows[rowIndex].reason = formdata.reason
            rows[rowIndex].date_casing = formdata.casingdate
            rows[rowIndex].approved = formdata.approved
            formdata.hanuman != null ? rows[rowIndex].hanuman = formdata.hanuman : rows[rowIndex].hanuman = false
            formdata.drone != null ? rows[rowIndex].drone = formdata.drone : rows[rowIndex].drone = false
            formdata.xry != null ? rows[rowIndex].xry = formdata.xry : rows[rowIndex].xry = false
            formdata.pr != null ? rows[rowIndex].pr = formdata.pr : rows[rowIndex].pr = false
            rows[rowIndex].date_changed = date + " " + time

            await rows[rowIndex].save();
            result = true
            teamupdated = await this.updateTeamName(formdata, code)
            if (teamupdated && result) {
                return true
            } else {
                console.error(teamupdated)
                return false
            }
        } catch (err) {
            console.error(err)
        }


    },


    updateRow: async function updateRow(record, files) {
        let date = new Date().toLocaleDateString("th-TH", { timeZone: 'Asia/Bangkok' })
        let time = new Date().toLocaleTimeString("th-TH", { timeZone: 'Asia/Bangkok' })
        let timestamp = date + " " + time
        let result, linemessage
        //placeid from post
        let placeid = record.placeid
        let headname = record.name.toString().replace(' ', '')
        let status = record.status
        //load sheet for getindex in sheet
        let rows = await this.loadSheet('operation')
        let rowIndex
        for (let index = 0; index < rows.length; index++) {
            if (rows[index].code == placeid) {
                rowIndex = index
            }
        }
        let systemcheckname = rows[rowIndex].headName.toString().replace(' ', '')
        let systemcheckid = rows[rowIndex].code.toString().replace(' ', '').toLocaleLowerCase()
        let checkcode = placeid.toString().trim().toLocaleLowerCase()

        const collator = new Intl.Collator('th');
        const order = collator.compare(systemcheckname, headname);
        if ((order == 0) && (checkcode == systemcheckid)) {
            let normal = 0
            let war = 0
            let thaicraft = 0
            let ammunition = 0
            let total = 0
            try {
                let folderId = rows[rowIndex].folderID
                folderId = folderId.replace('https://drive.google.com/drive/folders/', '')
                switch (status) {
                    case 'before':
                        rows[rowIndex].status = record.status
                        rows[rowIndex].timestamp = timestamp
                        rows[rowIndex].specialcase = record.specialcase
                        linemessage = `\n\nจุดเข้าค้นที่ ${record.placeid}\nสถานะ: ก่อนเข้าค้น \n\nหน.ชุดปฏิบัติ:\n${record.name}\nเบอร์โทร:${rows[rowIndex].contactNo}\n\nวัน/เวลาขณะส่งข้อมูล:\n${timestamp}\n\nภาพถ่ายประกอบการรายงาน:${rows[rowIndex].folderID}} `
                        try {
                            if(files!='')
                            this.sendimages(placeid, status, files, folderId)
                        } catch (err) {
                            console.error('Sending image error')
                        }
                        break;
                    case 'current':
                        normal = parseInt(record.normalguns)
                        war = parseInt(record.warguns)
                        thaicraft = parseInt(record.thaicraftguns)
                        ammunition = parseInt(record.ammunition)
                        rows[rowIndex].status = record.status
                        rows[rowIndex].normalGuns = record.normalguns
                        rows[rowIndex].warGuns = record.warguns
                        rows[rowIndex].thaicraftGuns = record.thaicraftguns
                        rows[rowIndex].ammunition = record.ammunition
                        rows[rowIndex].criminal = record.criminal
                        rows[rowIndex].etc = record.etc
                        rows[rowIndex].timestamp = timestamp
                        rows[rowIndex].specialcase = record.specialcase
                        linemessage = `\n\nจุดเข้าค้นที่ ${record.placeid}\nสถานะ: ขณะเข้าค้น \n\nหน.ชุดปฏิบัติ:\n${record.name}\nเบอร์โทร:${rows[rowIndex].contactNo}\n\nวัน/เวลาขณะส่งข้อมูล:\n${timestamp}\n\nพบของกลาง:\nอาวุธปืนทั่วไป:${record.normalguns}\nอาวุธปืนสงคราม:${record.warguns}\nอาวุธปืนไทยประดิษฐ์:${record.thaicraftguns}\nเครื่องยุทธภัณฑ์:${record.ammunition}\nอื่นๆ:${record.etc}\n\nภาพถ่ายประกอบการรายงาน:${rows[rowIndex].folderID}}`
                        try {
                            if(files!='')
                            this.sendimages(placeid, status, files, folderId)
                        }
                        catch (err) {
                            console.error('Sending image error')
                        }
                        break;

                    case 'after':
                        normal = parseInt(record.normalguns)
                        war = parseInt(record.warguns)
                        thaicraft = parseInt(record.thaicraftguns)
                        ammunition = parseInt(record.ammunition)
                        rows[rowIndex].status = record.status
                        rows[rowIndex].normalGuns = record.normalguns
                        rows[rowIndex].warGuns = record.warguns
                        rows[rowIndex].thaicraftGuns = record.thaicraftguns
                        rows[rowIndex].ammunition = record.ammunition
                        rows[rowIndex].criminal = record.criminal
                        rows[rowIndex].etc = record.etc
                        rows[rowIndex].timestamp = timestamp
                        rows[rowIndex].specialcase = record.specialcase
                        linemessage = `\n\nจุดเข้าค้นที่ ${record.placeid}\nสถานะ: หลังเข้าค้น \n\nหน.ชุดปฏิบัติ:\n${record.name}\nเบอร์โทร:${rows[rowIndex].contactNo}\n\nวัน/เวลาขณะส่งข้อมูล:\n${timestamp}\n\nพบของกลาง:\nอาวุธปืนทั่วไป:${record.normalguns}\nอาวุธปืนสงคราม:${record.warguns}\nอาวุธปืนไทยประดิษฐ์:${record.thaicraftguns}\nเครื่องยุทธภัณฑ์:${record.ammunition}\nอื่นๆ:${record.etc}\n\nภาพถ่ายประกอบการรายงาน:${rows[rowIndex].folderID}}`
                        try {
                            if(files!='')
                            this.sendimages(placeid, status, files, folderId)
                        } catch (err) {
                            console.error('Sending image error')
                        } break;

                }
                await rows[rowIndex].save();
                result = true
                if (result) {
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
            console.log('User input:' + headname + " รหัสเป้า :" + placeid)
            console.log('System :' + systemcheckname + " รหัสเป้า :" + rows[rowIndex].code)
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
            jsonobj.criminal = sheet.getCell(1, 5).value
            jsonobj.normalgun = sheet.getCell(1, 6).value
            jsonobj.wargun = sheet.getCell(1, 7).value
            jsonobj.thaicraftgun = sheet.getCell(1, 8).value
            jsonobj.ammunition = sheet.getCell(1, 9).value
            jsonobj.total = sheet.getCell(1, 10).value
            jsonobj.ammo = sheet.getCell(1, 11).value
            jsonstring = JSON.stringify(jsonobj);

        } catch (err) {
            console.error(err)
        }
        return (jsonstring)
    },

    gettotalcolumn : async function gettotalcolumn(){
        let alldata
        try {
            await doc.useServiceAccountAuth(creds)
            await doc.loadInfo()
            let sheet = await doc.sheetsByTitle['operation']
            let columncount = sheet.columnCount
            console.log(columncount)
            const newcell  = sheet.loadCells(0,columncount+1)
            newcell.value = 'test01'
            console.log(newcell.value)
            await sheet.saveUpdatedCells();
        } catch (err) {
            console.error(err)
        }
        return alldata
    }



}



