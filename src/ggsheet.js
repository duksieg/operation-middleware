
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { google } = require('googleapis');
const utils = require('./ggutils')
const fs = require('fs');
const linesender = require('./linenoti')
var creds = require('./key.json');
const ggutils = require('./ggutils');

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


    loadpoint: async function loadpoint(code) {
        let data_loadpoint
        try {
            let data = await this.loadSheet('operation')
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                if (element.code == code) {
                    data_loadpoint = element
                    break
                } else {
                    continue
                }
            }
        } catch (err) {
            console.error(err)
        }
        return data_loadpoint
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
                    break
                }
            }
            return rows[rowIndex]
        } catch (err) {
            console.error(err)
        }
    },

    getopbyCode : async function getopbyCode (code){
        try{
            let allrows  = await this.loadSheet('operation')
            let rowIndex
            for (let index = 0; index < allrows.length; index++) {
                const element = allrows[index];
                if(allrows[index].code == code){
                    rowIndex = index
                break
                }
            }
            return allrows[rowIndex]
        }catch(err){
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
        let placeid = record.placeid.toString().trim()
        let status = record.status
        //load sheet for getindex in sheet
        let rows = await this.loadSheet('operation')
        let rowIndex
        for (let index = 0; index < rows.length; index++) {
            if (rows[index].code == placeid) {
                rowIndex = index
            }
        }
        try {
            let folderId = rows[rowIndex].folderID
            let flag_success = false
            //folderId = folderId.replace('https://drive.google.com/drive/folders/', '')
            if (status == 'before') {
                rows[rowIndex].status = record.status
                rows[rowIndex].timestamp = timestamp
                rows[rowIndex].specialcase = record.specialcase
                linemessage = `\n\nจุดเข้าค้นที่ ${record.placeid}\nสถานะ: ก่อนเข้าค้น \n\nหน.ชุดปฏิบัติ:\n${record.name}\nเบอร์โทร:${rows[rowIndex].contactNo}\n\nวัน/เวลาขณะส่งข้อมูล:\n${timestamp}\n\nภาพถ่ายประกอบการรายงาน:${rows[rowIndex].folderID}} `
                try {
                    if (files != '') {
                        flag_success = utils.sendimages(placeid, status, files, folderId)
                    } else {
                        flag_success = true
                    }

                } catch (err) {
                    console.error(placeid + ' : Sending image error')
                }
            } else if (status == 'current' || status == 'after') {
                if (record.criminal_current != rows[rowIndex].criminal_current) rows[rowIndex].criminal_current = record.criminal_current
                if (record.criminal_wanted != rows[rowIndex].criminal_wanted) rows[rowIndex].criminal_wanted = record.criminal_wanted

                //weapon update
                if (record.gun_registered != rows[rowIndex].gun_registered) rows[rowIndex].gun_registered = record.gun_registered
                if (record.gun_unregistered != rows[rowIndex].gun_unregistered) rows[rowIndex].gun_unregistered = record.gun_unregistered
                if (record.gun_thaicraft != rows[rowIndex].gun_thaicraft) rows[rowIndex].gun_thaicraft = record.gun_thaicraft
                if (record.gun_modified != rows[rowIndex].gun_modified) rows[rowIndex].gun_modified = record.gun_modified
                if (record.gun_war != rows[rowIndex].gun_war) rows[rowIndex].gun_war = record.gun_war
                //ammo
                if (record.ammo_shotshell != rows[rowIndex].ammo_shotshell) rows[rowIndex].ammo_shotshell = record.ammo_shotshell
                if (record.ammo_airgun != rows[rowIndex].ammo_airgun) rows[rowIndex].ammo_airgun = record.ammo_airgun
                if (record.ammo_9mm != rows[rowIndex].ammo_9mm) rows[rowIndex].ammo_9mm = record.ammo_9mm
                if (record.ammo_11mm != rows[rowIndex].ammo_11mm) rows[rowIndex].ammo_11mm = record.ammo_11mm
                if (record.ammo_22 != rows[rowIndex].ammo_22) rows[rowIndex].ammo_22 = record.ammo_22
                if (record.ammo_38 != rows[rowIndex].ammo_38) rows[rowIndex].ammo_38 = record.ammo_38
                if (record.ammo_380 != rows[rowIndex].ammo_380) rows[rowIndex].ammo_380 = record.ammo_380
                if (record.ammo_357 != rows[rowIndex].ammo_357) rows[rowIndex].ammo_357 = record.ammo_357
                if (record.ammo_556 != rows[rowIndex].ammo_556) rows[rowIndex].ammo_556 = record.ammo_556
                if (record.ammo_762 != rows[rowIndex].ammo_762) rows[rowIndex].ammo_762 = record.ammo_762
                //ammunition
                if (record.explosive != rows[rowIndex].explosive) rows[rowIndex].explosive = record.explosive
                if (record.barrel != rows[rowIndex].barrel) rows[rowIndex].barrel = record.barrel
                if (record.trigger != rows[rowIndex].trigger) rows[rowIndex].trigger = record.trigger
                if (record.bolt_action != rows[rowIndex].bolt_action) rows[rowIndex].bolt_action = record.bolt_action
                if (record.magazine != rows[rowIndex].magazine) rows[rowIndex].magazine = record.magazine
                if (record.silencer != rows[rowIndex].silencer) rows[rowIndex].silencer = record.silencer
                if (record.light_absorb != rows[rowIndex].light_absorb) rows[rowIndex].light_absorb = record.light_absorb
                if (record.scope != rows[rowIndex].scope) rows[rowIndex].scope = record.scope

                if (record.etc != rows[rowIndex].etc) rows[rowIndex].etc = record.etc.toString().trim()
                rows[rowIndex].timestamp = timestamp
                rows[rowIndex].specialcase = record.specialcase

                let status_tothai
                if (status == 'current') {
                    status_tothai = 'ขณะเข้าค้น'
                } else {
                    status_tothai = 'หลังเข้าค้น'
                }

                linemessage = `\n\nจุดเข้าค้นที่ ${record.placeid}\nสถานะ: ${status_tothai} \n\nหน.ชุดปฏิบัติ:\n${record.name}\nเบอร์โทร:${rows[rowIndex].contactNo}\n\nวัน/เวลาขณะส่งข้อมูล:\n${timestamp}\n\nพบของกลาง:\nอาวุธปืนทั่วไป:${record.normalguns}\nอาวุธปืนสงคราม:${record.warguns}\nอาวุธปืนไทยประดิษฐ์:${record.thaicraftguns}\nเครื่องยุทธภัณฑ์:${record.ammunition}\nอื่นๆ:${record.etc}\n\nภาพถ่ายประกอบการรายงาน:${rows[rowIndex].folderID}}`
                try {
                    if (files != '') {
                        flag_success = utils.sendimages(placeid, status, files, folderId)
                    } else {
                        flag_success = true
                    }
                }
                catch (err) {
                    console.error(placeid + ': Sending image error')
                }
            } else {
                console.log(placeid + ': could not get status')
            }
            if (flag_success = true) {
                await rows[rowIndex].save();
                let jsonData = {
                    message: linemessage,
                }
                // let response = await linesender.linenoti(jsonData,placeid)

                return true
            }

        } catch (err) {
            console.error('User input :' + placeid + 'get error' + err)
            let reserr = "รหัสจุดค้นที่ : " + placeid + " reason : " + err
            return reserr
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

    updateRowfolderID: async function updateRowfolderID() {

        let rowsdata = await this.loadSheet('operation')
        try {
            for (let index = 0; index < rowsdata.length; index++) {
                const element = rowsdata[index];
                let respfolder = await ggutils.getfolderid(element.code)
                rowsdata[index].folderID = respfolder[0].id            
                await rowsdata[index].save();
            }
            return true
        } catch (err) {
            console.error(err)
        }
    },


}



