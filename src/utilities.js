
const res = require('express/lib/response');
const fs = require('fs');
const { logger} = require('../src/logConfig')

const lstCollect = /[0-9]{2}\.[0-9]{2}\.[0-9]{4}\s[0-9]{2}:[0-9]{2}:[0-9]{2}/g
const finddatetime = /[0-9]{2}\s?\w+\s?[0-9]{4}\s+[0-9]{2}?:[0-9]{2}/g
const search2value = /(\w+:?\s\d+)/g
const finddate = /[0-9]{2}\s?\w+\s?[0-9]{4}/g
const findtime = /[0-9]{2}?:[0-9]{2}/g
const tel10digit = /(0[0-9]{9})/gm
const tel66digit = /(66[0-9]{9})/gm
const firebasemodule = require('../src/firebaseModule')
const objtemplate = {
    Subscriber4G5G: '',
    Source: '',
    MSISDN: '',
    position: { lat: '', lng: '' },
    IMSI: '',
    TAC: '',
    LAC: '',
    CellId: '',
    ECID: '',
    LCID: '',
    ENB: '',
    OperatorName: '',
    SubscriberStatus: '',
    CountryName: '',
    MCC: '',
    MNC: '',
    Roaming: '',
    LastCollectResult: '',
    LastCollectMilli: '',
    stampdatetime: getDateTimeThai(),
}
const hometemplate = {
    rel: '',
    position: '',
    adr: '',
    tel: '',
}


function parseDateddMMyyyy(rawdatetime) {
    let newDatetime
    try {
        let splitdatetime = rawdatetime.split(" ")
        let newDate = splitdatetime[0].split(".")
        let newTime = splitdatetime[1].split(":")
        newDatetime = new Date(newDate[2], newDate[1], newDate[0], newTime[0], newTime[1], newTime[2])
        newDatetime = newDatetime.getTime();
    } catch (error) {
        logger.info(error);
        logger.info("Failed parse datetime to millisecond");
        newDatetime = ''
    }
    logger.info("Date time : " + newDatetime);
    return newDatetime
}

function parseDateMMddyyyy(rawdatetime) {
    let newDatetime
    try {
        let splitdatetime = rawdatetime.split(" ")
        let newDate = splitdatetime[0].split("/")
        let newTime = splitdatetime[1].split(":")
        newDatetime = new Date(newDate[2], newDate[0], newDate[1], newTime[0], newTime[1], newTime[2])
        newDatetime = newDatetime.getTime();
        logger.info('parse datetime success')
    } catch (error) {
        logger.info(error);
        logger.info("Failed parse datetime to millisecond");
        newDatetime = ''
    }
    return newDatetime
}

function parseDateUTC(rawdatetime) {
    //"03 May 2022 10:15 +07"
    let newDatetime
    logger.info(rawdatetime)
    try {
        let finddateResult = finddate.exec(rawdatetime)
        let findtimeResult = findtime.exec(rawdatetime)
        newDatetime = new Date(finddateResult[0] + "," + findtimeResult[0])
        newDatetime = newDatetime.getTime()
        logger.info('parse datetime success')

    } catch (error) {
        logger.info(error);
        logger.info("Failed parse datetime to millisecond");
        newDatetime = ''
    }
    return newDatetime
}

function setHomeObject(splitText) {
    let lat, long
    splitText.forEach(element => {
        element.search('rel') != -1 ? hometemplate.rel = element.split(":")[1].trim() : ''
        element.search('lat') != -1 ? lat = element.split(":")[1].trim() : ''
        element.search('long') != -1 ? long = element.split(":")[1].trim() : ''
        element.search('lng') != -1 ? long = element.split(":")[1].trim() : ''
        element.search('adr') != -1 ? hometemplate.adr = element.split(":")[1].trim() : ''
        let position = { lat: lat, lng: long }
        hometemplate.position = position
    })
    return hometemplate
}

async function webSetOther(in_obj) {
    hometemplate.rel = in_obj.relation
    hometemplate.adr = in_obj.address
    hometemplate.type = in_obj.type
    hometemplate.tel = in_obj.tel
    try {
        if (in_obj.position != null) {
            let position = in_obj.position.split(",")
            let newPosition = { lat: position[0], lng: position[1] }
            hometemplate.position = newPosition
            logger.info('position justify success')
        }
        if(in_obj.datepicker !=null || in_obj.datepicker!=''){
            let datetimemilli = new Date(in_obj.datepicker)
            let datemilli = Date.parse(datetimemilli)
            hometemplate.datetime = datemilli
        }
        let result = firebasemodule.addNewHome(in_obj.opName, hometemplate)
        logger.info('data appened home base')
        logger.info(hometemplate)
        if (result) {
            return true
        } else false
    } catch (err) {
        return false
    }

}
function extractor(element) {
    let extract = element.match(search2value)
    logger.info(extract)
    return extract
}
function justifyPosition(rawposition) {
    let position
    if (rawposition != null && rawposition.includes(",")) {
        logger.info('Found position key')
        let getlatlng = rawposition.trim().replace(" ", "").split(",")
        position = { lat: getlatlng[0], lng: getlatlng[1] }
        resultPosition = position
    }
    return position
}
function setPointObject(splitText) {
    let lat, long
    splitText.forEach(element => {
        element.toLowerCase().search("subscriber is on") != -1 ? objtemplate.Subscriber4G5G = '4G' : ''
        element.toLowerCase().search("subscriber status") != -1 ? objtemplate.SubscriberStatus = element.split(":")[1].trim() : ''
        element.toLowerCase().search("source") != -1 ? objtemplate.Source = element.split(":")[1].trim() : ''
        element.toLowerCase().search("position") != -1 ? objtemplate.position = justifyPosition(element.split(":")[1].trim()) : ''
        element.toLowerCase().search("roamingposition") != -1 ? objtemplate.position = element.split(":")[1].trim() : ''
        element.toLowerCase().search("latitude") != -1 ? lat = element.split(":")[1].replace(',', "").trim() : ''
        element.toLowerCase().search("longitude") != -1 ? long = element.split(":")[1].replace(',', "").trim() : ''
        element.toLowerCase().search("msisdn") != -1 ? objtemplate.MSISDN = element.split(":")[1].trim() : ''
        element.toLowerCase().search("imsi") != -1 ? objtemplate.IMSI = element.split(":")[1].trim() : ''
        element.toLowerCase().search("lac") != -1 ? objtemplate.LAC = element.split(":")[1].trim() : ''
        element.toLowerCase().search("cell id") != -1 ? objtemplate.CellId = element.split(":")[1].trim() : ''
        element.toLowerCase().search("network name") != -1 ? objtemplate.OperatorName = element.split(":")[1].trim() : ''
        element.toLowerCase().search("operator name") != -1 ? objtemplate.OperatorName = element.split(":")[1].trim() : ''
        element.toLowerCase().search("visiting country") != -1 ? objtemplate.CountryName = element.split(":")[1].trim() : ''
        element.toLowerCase().search("home country") != -1 ? objtemplate.CountryName = element.split(":")[1].trim() : ''
        element.toLowerCase().search("country name") != -1 ? objtemplate.CountryName = element.split(":")[1].trim() : ''
        element.toLowerCase().search("home mcc") != -1 ? objtemplate.MCC = element.split(":")[1].trim() : ''
        element.toLowerCase().search("home mnc") != -1 ? objtemplate.MNC = element.split(":")[1].trim() : ''
        element.toLowerCase().search("roaming") != -1 ? objtemplate.Roaming = element.split(":")[1].trim() : ''
        element.toLowerCase().search("ecid") != -1 ? objtemplate.ECID = element.split(":")[1].trim() : ''
        element.toLowerCase().search("tac") != -1 ? objtemplate.TAC = element.split(":")[1].trim() : ''
        element.toLowerCase().search("lcid") != -1 ? objtemplate.LCID = element.split(":")[1].trim() : ''
        element.toLowerCase().search("enb") != -1 ? objtemplate.ENB = element.split(":")[1].trim() : ''

        if (element.toLowerCase().search("mcc") != -1 && element.toLowerCase().search("mnc") != -1) {
            let getdoubleValue = extractor(element)
            if (getdoubleValue.length == 2) {
                objtemplate.MCC = getdoubleValue[0].split(":")[1].trim()
                objtemplate.MNC = getdoubleValue[1].split(":")[1].trim()
            }
        }
        if (element.toLowerCase().search("tac") != -1 && element.toLowerCase().search("ecid") != -1) {
            let getdoubleValue = extractor(element)
            if (getdoubleValue.length == 2) {
                objtemplate.TAC = getdoubleValue[0].split(":")[1].trim()
                objtemplate.ECID = getdoubleValue[1].split(":")[1].trim()
            }
        }
        if (element.toLowerCase().search("lac") != -1 && element.toLowerCase().search("cell id") != -1) {
            let getdoubleValue = extractor(element)
            if (getdoubleValue.length == 2) {
                objtemplate.LAC = getdoubleValue[0].split(":")[1].trim()
                objtemplate.CellId = getdoubleValue[1].split(":")[1].trim()
            }
        }

        //check datetime format ket LastCollectResult
        if (element.match(lstCollect)) {
            logger.info('found last collect format')
            objtemplate.LastCollectResult = element.replace("ปิดเครื่อง", "").trim()
            objtemplate.LastCollectMilli = parseDateddMMyyyy(objtemplate.LastCollectResult.replace("ปิดเครื่อง", "").trim())
        }
        //check datetime format datetime
        if (element.toLowerCase().search("datetime") != -1) {
            if (element.trim().match(finddatetime)) {
                let rawdatetime = finddatetime.exec(element.trim())
                let parseDate = parseDateUTC(rawdatetime[0])
                if (parseDate != '') {
                    objtemplate.LastCollectResult = parseDate.toLocaleString()
                    objtemplate.LastCollectMilli = parseDate
                }
            } else {
                logger.info('cannot parse datetime getmsg : ' + element)
            }
        }
        if (lat != null && long != null) {
            objtemplate.position = { lat: lat, lng: long }
        }

    });



    return objtemplate
}

function setPointObjectFormat2(splitText) {

    for (let index = 0; index < splitText.length; index++) {
        const element = splitText[index]
        let nextline = splitText[index + 1]
        if (nextline != undefined) {
            nextline = splitText[index + 1].replace('\r', '')
        }
        if (element.toLowerCase().search("datetime") != -1) {
            if (nextline.match(finddatetime)) {
                let rawdatetime = finddatetime.exec(nextline)
                let parseDate = parseDateUTC(rawdatetime[0])
                if (parseDate != '') {
                    objtemplate.LastCollectResult = nextline
                    objtemplate.LastCollectMilli = parseDate
                }
            } else {
                logger.info('cannot parse datetime getmsg : ' + nextline)
            }
        }
        element.toLowerCase().search("msisdn") != -1 ? objtemplate.MSISDN = nextline : ''
        element.toLowerCase().search("position") != -1 ? objtemplate.position = justifyPosition(nextline) : ''
        element.toLowerCase().search('address') != -1 ? objtemplate.Address = nextline : ''
        element.toLowerCase().search("imsi") != -1 ? objtemplate.IMSI = nextline : ''
        element.toLowerCase().search('country name') != -1 ? objtemplate.CountryName = nextline : ''
        element.toLowerCase().search('network name') != -1 ? objtemplate.CountryName = nextline : ''
        element.toLowerCase().search("network type") != -1 ? objtemplate.Subscriber4G5G = nextline : ''
        element.toLowerCase().search('mcc') != -1 ? objtemplate.MCC = nextline : ''
        element.toLowerCase().search('mnc') != -1 ? objtemplate.MNC = nextline : ''
        element.toLowerCase().search('lac') != -1 ? objtemplate.LAC = nextline : ''
        element.toLowerCase().search('ci') != -1 ? objtemplate.CellId = nextline : ''
        element.toLowerCase().search('subscriber status') != -1 ? objtemplate.SubscriberStatus = nextline : ''
    }
    return objtemplate

}

async function splitBaseMsgForWeb(linemsg, opname) {
    let objdata

    try {
        // normal
        if (linemsg.toLowerCase().includes("msisdn")) {
            let splitText = linemsg.split('\n')
            let isJumpline = false
            splitText.forEach(element => {
                if (element.toLowerCase().search("datetime") != -1) {
                    isJumpline = true
                }
            });
            if (isJumpline) {
                logger.info('processing justify jumpline')
                objdata = setPointObjectFormat2(splitText)
            }
            else {
                logger.info('processing justify normal base')
                objdata = setPointObject(splitText)
            }
        }

        return objdata
    } catch (err) {
        logger.info('splitline error')
        logger.info(err)
    }
}

async function splitLineBase(linemsg, opname) {
    let result, objdata
    try {
        if (linemsg.toLowerCase().includes("msisdn")) {
            let splitText = linemsg.split('\n')
            let isJumpline = false
            splitText.forEach((element,index) => {
                let nextline = element[index+1]
                if (element.toLowerCase().search("datetime") != -1 && nextline.split(":")[1].trim() != '') {
                    isJumpline = true
                }
            });
            if (isJumpline) {
                objdata = setPointObjectFormat2(splitText)
                result = firebasemodule.addNewPoint(opname, objdata)
                logger.info('data appened jumb line')
            } else if (linemsg.includes("#bd")) {
                objdata = setHomeObject(splitText)
                result = firebasemodule.addNewHome(opname, objdata)
                logger.info('data appened home base')

            } else {
                objdata = setPointObject(splitText)
                result = firebasemodule.addNewPoint(opname, objdata)
                logger.info('data appened tel base')
            }


        }
        return result
    } catch (err) {
        logger.info('splitline error')
        logger.info(err)
    }
}

function splitTelPosition(splitText) {
    let lat, long
    const lacdata = { tel: '', position: '' }
    splitText.forEach(element => {
        element.toLowerCase().search("position") != -1 ? lacdata.position = justifyPosition(element.split(":")[1].trim()) : ''
        element.toLowerCase().search("latitude") != -1 ? lat = element.split(":")[1].replace(',', "").trim() : ''
        element.toLowerCase().search("longitude") != -1 ? long = element.split(":")[1].replace(',', "").trim() : ''
        element.toLowerCase().search("msisdn") != -1 ? lacdata.tel = element.split(":")[1].trim() : ''
    })
    if (lat != null && long != null) {
        lacdata.position = { lat: lat, lng: long }
    }
    return lacdata
}
async function gatherTelSet(linemsg) {
    let lead_0digit, lead_66digit, allTel = []
    lead_0digit = linemsg.match(tel10digit)
    lead_66digit = linemsg.match(tel66digit)
    if (lead_0digit > 0 || lead_66digit.length > 0) {
        allTel = lead_0digit.concat(lead_66digit)
    }
    return allTel
}

async function lineTelDistance(linemsg) {
    let splitText = linemsg.split('\n')
    let lacdata = splitTelPosition(splitText)
    let { getDistance } = await import('./geolocation.mjs')
    if (lacdata.position != '' && lacdata.tel != '') {
        logger.info('processing line distance')
        let subTel = lacdata.tel.substring('2', lacdata.tel.length)
        let allplaces = await firebasemodule.gatherPlaces('op_taiwai')
        let replyMessage = `เบอร์ ${lacdata.tel}`
        logger.info('Processing line distance')
        Object.entries(allplaces).forEach((place) => {
            //finding objdata
            place.forEach(element => {
                if (element.tel != null) {
                    let placeData = place[1]
                    if (placeData.tel.includes(subTel)) {
                        let distance = getDistance(lacdata.position, placeData.position)
                        if (distance > 1000) {
                            distance = (Number(distance / 1000).toFixed(2)).toLocaleString()
                            replyMessage = replyMessage.concat(`\n - ระยะห่าง ${distance} กม. จากจุด ${placeData.rel} รายละเอียด ${placeData.adr}`)
                        } else {
                            distance = (Number(distance).toFixed(2)).toLocaleString()
                            replyMessage = replyMessage.concat(`\n - ระยะห่าง ${distance} ม. จากจุด ${placeData.rel} รายละเอียด ${placeData.adr}`)
                        }
                    }
                }
            })
        })
        return (replyMessage)
    }else{
        logger.info('cannot set position calculation failed')
    }

}


function getDateTimeThai() {
    let objDate = new Date()
    var numberOfMlSeconds = objDate.getTime();
    var addMlSeconds = (7 * 60) * 60 * 1000;
    var newDateObj = new Date(numberOfMlSeconds + addMlSeconds);
    let newDate = Date.parse(newDateObj)
    return newDate
}

// function convertDate(){
//     let olddate = 1654622401370
//     var addMlSeconds = (7 * 60) * 60 * 1000;
//     var newDateObj = new Date(olddate + addMlSeconds)
//     logger.info(Date.parse(newDateObj))
// }

// convertDate()

// function testSendingImage(){
//     return
// }
// testSendingImage()
// function testSplitBase() {
//     const data = fs.readFileSync('rawdata.txt', 'utf8')
//     let objdata = lineTelDistance(data)
// }

// testSplitBase()

module.exports = { splitBaseMsgForWeb, splitLineBase, webSetOther, lineTelDistance }
