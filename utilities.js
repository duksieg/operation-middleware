
const fs = require('fs')
const splice2values = /:\s\w+/g;
const lstCollect = /[0-9]{2}\.[0-9]{2}\.[0-9]{4}\s[0-9]{2}:[0-9]{2}:[0-9]{2}/g

async function updateEvidence(opName, file, item) {

    if (!fs.existsSync(`./op/${opName}`)) {
        fs.mkdirSync(`./op/${opName}`)

    }
}

function extractor(str) {
    const regex = /:\s\w+/g;
    //str = `TAC: 1077 eCID: 41205962\\r`;
    let m;
    let doubleValue = []
    while ((m = splice2values.exec(str)) !== null) {
        console.log(`Found ${m[0]}. Next starts at ${splice2values.lastIndex}.`);
        doubleValue.push(m[0])
        // expected output: "Found foo. Next starts at 9."
        // expected output: "Found foo. Next starts at 19."
    }
    return doubleValue
}

function getdatetimeraw(rawdatetime) {
    let newDatetime
    try {
        let splitdatetime = rawdatetime.split(" ")
        let newDate = splitdatetime[0].split(".")
        let newTime = splitdatetime[1].split(":")
        newDatetime = new Date(newDate[2], newDate[1], newDate[0], newTime[0], newTime[1], newTime[2])
        newDatetime = newDatetime.getTime();
    } catch (error) {
        console.log(error);
        console.log("Failed parse datetime to millisecond");
        newDatetime = ''
    }
    console.log("Date time : "+newDatetime);
    return newDatetime
}

function format1ToObject(splitText, objtemplate) {
    splitText.forEach(element => {
        objtemplate.Subscriber4G5G = true
        element.toLowerCase().search("position") != -1 ? objtemplate.position = element.split(":")[1].trim() : ''
        element.toLowerCase().search("msisdn") != -1 ? objtemplate.MSISDN = element.split(":")[1].trim() : ''
        element.toLowerCase().search("imsi") != -1 ? objtemplate.IMSI = element.split(":")[1].trim() : ''
        if (element.toLowerCase().search("tac") != -1 && element.toLowerCase().search("ecid") != -1) {
            let getdoubleValue = extractor(element)
            if (getdoubleValue.length == 2) {
                objtemplate.TAC = getdoubleValue[0].replace(":", "").trim()
                objtemplate.ECID = getdoubleValue[1].replace(":", "").trim()
            }
        }
        element.toLowerCase().search("lcid") != -1 ? objtemplate.LCID = element.split(":")[1].trim() : ''
        element.toLowerCase().search("enb") != -1 ? objtemplate.ENB = element.split(":")[1].trim() : ''
        element.toLowerCase().search("subscriber status") != -1 ? objtemplate.SubscriberStatus = element.split(":")[1].trim() : ''
        element.toLowerCase().search("country name") != -1 ? objtemplate.CountryName = element.split(":")[1].trim() : ''
        if (element.toLowerCase().search("mcc") != -1 && element.toLowerCase().search("mnc") != -1) {
            let getdoubleValue = extractor(element)
            if (getdoubleValue.length == 2) {
                objtemplate.MCC = getdoubleValue[0].replace(":", "").trim()
                objtemplate.MNC = getdoubleValue[1].replace(":", "").trim()
            }
        }
        element.toLowerCase().search("operator name") != -1 ? objtemplate.OperatorName = element.split(":")[1].trim() : ''
    });
    return objtemplate
}

function format2ToObject(splitText, objtemplate) {
    let lat, long
    splitText.forEach(element => {
        element.toLowerCase().search("subscriber is on") != -1 ? objtemplate.Subscriber4G5G = true : ''
        element.toLowerCase().search("source") != -1 ? objtemplate.Source = element.split(":")[1].trim() : ''
        element.toLowerCase().search("latitude") != -1 ? lat = element.split(":")[1].trim() : ''
        element.toLowerCase().search("longitude") != -1 ? long = element.split(":")[1].trim() : ''
        element.toLowerCase().search("msisdn") != -1 ? objtemplate.MSISDN = element.split(":")[1].trim() : ''
        element.toLowerCase().search("imsi") != -1 ? objtemplate.IMSI = element.split(":")[1].trim() : ''
        element.toLowerCase().search("ecid") != -1 ? objtemplate.ECID = element.split(":")[1].trim() : ''
        element.toLowerCase().search("tac") != -1 ? objtemplate.TAC = element.split(":")[1].trim() : ''
        element.toLowerCase().search("lcid") != -1 ? objtemplate.LCID = element.split(":")[1].trim() : ''
        element.toLowerCase().search("enb") != -1 ? objtemplate.ENB = element.split(":")[1].trim() : ''
        element.toLowerCase().search("subscriber status") != -1 ? objtemplate.SubscriberStatus = element.split(":")[1].trim() : ''
        element.toLowerCase().search("operator name") != -1 ? objtemplate.OperatorName = element.split(":")[1].trim() : ''
        element.toLowerCase().search("home country") != -1 ? objtemplate.CountryName = element.split(":")[1].trim() : ''
        element.toLowerCase().search("home mcc") != -1 ? objtemplate.MCC = element.split(":")[1].trim() : ''
        element.toLowerCase().search("home mnc") != -1 ? objtemplate.MNC = element.split(":")[1].trim() : ''
        element.toLowerCase().search("roaming") != -1 ? objtemplate.Roaming = element.split(":")[1].trim() : ''
        if (element.match(lstCollect)) {
            objtemplate.LastCollectResult = element
        }
    });
    let position = lat + "," + long
    objtemplate.position = position
    return objtemplate
}

function format3ToObject(splitText, objtemplate) {
    let lat, long
    splitText.forEach(element => {
        element.toLowerCase().search("source") != -1 ? objtemplate.Source = element.split(":")[1].trim() : ''
        element.toLowerCase().search("latitude") != -1 ? lat = element.split(":")[1].trim() : ''
        element.toLowerCase().search("longitude") != -1 ? long = element.split(":")[1].trim() : ''
        element.toLowerCase().search("msisdn") != -1 ? objtemplate.MSISDN = element.split(":")[1].trim() : ''
        element.toLowerCase().search("imsi") != -1 ? objtemplate.IMSI = element.split(":")[1].trim() : ''
        element.toLowerCase().search("lac") != -1 ? objtemplate.LAC = element.split(":")[1].trim() : ''
        element.toLowerCase().search("cell od") != -1 ? objtemplate.CellId = element.split(":")[1].trim() : ''
        element.toLowerCase().search("subscriber status") != -1 ? objtemplate.SubscriberStatus = element.split(":")[1].trim() : ''
        element.toLowerCase().search("operator name") != -1 ? objtemplate.OperatorName = element.split(":")[1].trim() : ''
        element.toLowerCase().search("home country") != -1 ? objtemplate.CountryName = element.split(":")[1].trim() : ''
        element.toLowerCase().search("home mcc") != -1 ? objtemplate.MCC = element.split(":")[1].trim() : ''
        element.toLowerCase().search("home mnc") != -1 ? objtemplate.MNC = element.split(":")[1].trim() : ''
        element.toLowerCase().search("roaming") != -1 ? objtemplate.Roaming = element.split(":")[1].trim() : ''
        if (element.match(lstCollect)) {
            objtemplate.LastCollectResult = element.replace("ปิดเครื่อง", "").trim()
        }
    });
    let position = lat + "," + long
    objtemplate.position = position
    return objtemplate
}
function splitLineBase(linemsg) {
    let objtemplate = {
        Subscriber4G5G: '',
        Source: '',
        MSISDN: '',
        position: '',
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
        stampdatetime: Date.now(),
    }
    let objdata
    if (linemsg.includes("MSISDN")) {
        let splitText = linemsg.split("\n")
        //format 1
        if (splitText[0].includes("Subscriber")) {
            objdata = format1ToObject(splitText, objtemplate)
        } else if (splitText[1].includes("Subscriber")) {
            objdata = format2ToObject(splitText, objtemplate)
        } else if (splitText[1].includes("Source")) {
            objdata = format3ToObject(splitText, objtemplate)
        }
        objdata.LastCollectMilli = objdata.LastCollectResult !='' ? getdatetimeraw(objdata.LastCollectResult) :''
        console.log(objdata);
    }
    return objdata
}


module.exports = { updateEvidence, splitLineBase }