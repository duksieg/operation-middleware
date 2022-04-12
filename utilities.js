const fs = require('fs')

const patternNumber = /^[0-9]{11}/gm
const patternSplice = /(?:\S+\s)?\S*:\S*(?:\s\S+)?/gm


async function updateEvidence(opName,file,item){

        if(!fs.existsSync(`./op/${opName}`)){
            fs.mkdirSync(`./op/${opName}`)
            
        }
    }

function getdatetimeraw(rawdatetime) {
    let splitdatetime = rawdatetime.split(" ")
    let newDate = splitdatetime[0].split(".")
    let newTime = splitdatetime[1].split(":")
    //let newDatetime = new Date(newDate[2],newDate[1],newDate[0],newTime[0],newTime[1],newTime[2]) production
   // let milliseconds = newDatetime.getTime(); production

    let newDatetime = Date.now()
    console.log(newDatetime);
    return newDatetime
}

function splitLineBase(rawtext){
    let phonenumber = patternNumber.exec(rawtext)
    let newTextRemoveTel = rawtext.substring(rawtext.indexOf("Subscriber"),rawtext.length)
    let dataText = newTextRemoveTel.split(/\s{4}/g)
    let pointsObj = {}

    pointsObj['tel'] = phonenumber[0]
    for (let index = 0; index < dataText.length; index++) {
        const element = dataText[index];

        if(index == dataText.length-1){
            pointsObj['datetime'] = element
            pointsObj['datetimemilli']=getdatetimeraw(element)
        }else{
        let keypair = element.split(":")
        pointsObj[keypair[0].replace("/","")] = keypair[1]
        }
    }
    return pointsObj
}

module.exports={updateEvidence,splitLineBase}