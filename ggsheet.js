
const { json } = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const sheetID = "1FCJV5Flm1iAHVdSYfM7EPXtN_jdgO1tVPkUkGu-z568"
const doc = new GoogleSpreadsheet(sheetID);
var creds = require('./key.json');

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

    getRowdata: async function getRowdata() {
        let arry = []
        let allrow = await this.loadSheet()
        for (let index = 0; index < allrow.length; index++) {
            let jobj = {
                pointno: allrow[index].no,
                coderank: allrow[index].code,
                fullname: allrow[index].fullname,
                latlng: allrow[index].LatLng
            }
            arry.push(jobj)
        }
        return arry
    },



    updateRow: async function updateRow(record) {
        let result
        let placeid = record.placeid
        let rows = await this.loadSheet()
        let rowIndex
        for (let index = 0; index < rows.length; index++) {
            if (rows[index].no == placeid) {
                rowIndex = index
            }
        }
        console.log('Row index :' + rowIndex)
        console.log(record)
        switch (record.status) {
            case 'before':
                rows[rowIndex].status = record.status
                rows[rowIndex].headName = record.name
                rows[rowIndex].contactNo = record.tel
                rows[rowIndex].beforeReport = record.reporttext
                break;
            case 'current':
                rows[rowIndex].status = record.status
                rows[rowIndex].currentReport = record.reporttext
                break;

            case 'after':
                rows[rowIndex].status = record.status
                rows[rowIndex].afterReport = record.reporttext
                rows[rowIndex].normalGuns = record.normalguns
                rows[rowIndex].warGuns = record.warguns
                rows[rowIndex].thaicraftGuns = record.thaicraftguns
                rows[rowIndex].ammunition = record.ammunition
                break;

        }
        await rows[rowIndex].save();
        result = true

        // save changes
        //const { placeid,status,name, tel ,reporttext,images} = 



        return result
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
            jsonobj.all = sheet.getCell(1,0).value
            jsonobj.before = sheet.getCell(1,1).value
            jsonobj.current = sheet.getCell(1,2).value
            jsonobj.after = sheet.getCell(1,3).value
            jsonobj.normalgun = sheet.getCell(1,4).value
            jsonobj.wargun = sheet.getCell(1, 5).value
            jsonobj.thaicraftgun = sheet.getCell(1,6).value
            jsonobj.ammunition = sheet.getCell(1,7).value
            jsonstring = JSON.stringify(jsonobj);

        } catch (err) {
            console.error(err)
        }
        return (jsonstring)
    }

}



