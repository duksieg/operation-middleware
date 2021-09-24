const express = require('express')
const app = express()
var util = require('./ggsheet')
var linesender = require('./linenoti')
const fileupload = require('express-fileupload')
const fs = require('fs')
const cor = require('cors')
const { hasUncaughtExceptionCaptureCallback } = require('process')
app.set('view engine', 'ejs');
app.use(cor())
app.use(express.urlencoded({ extended: true }));
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

var map = initialload()

app.get("/", async (req, res) => {
    res.render('index', { point: map.get('point'), agent: map.get('agentname') })
})


app.post("/saverecord", async (req, res) => {
    let checkstatus = await util.updateRow(req.body, req.files.filestore)
    if (checkstatus == true) {
        res.render('success')
    } else if (checkstatus == 'notmatch') {
        res.render('notmatch', { reason: 'รหัสจุดค้น และ ชื่อหัวหน้าชุด ไม่ตรงกับในระบบ' })
    } else {
        res.render('notmatch', { reason: checkstatus })
    }
})

app.get("/info", async (req, res) => {
    let total = await util.gettotalData()
    res.send(total)
})

app.post("/imagesbyuser", async (req, res) => {
    //let folderid = req.body.records
    //let jsonstr = JSON.stringify(req) 

    console.log(req)
    // let resp = await util.getimages(folderid,'1PNFS7vp9ReWMHBROjIhYg70qGGqaASb5') 
    // let jsonObj = new Object()
    // let jsonstring
    // jsonObj.records = resp
    // jsonstring = JSON.stringify(jsonObj)
    // console.log(jsonstring)
    res.send(req.body.username)
})




app.get("/detail", async (req, res) => {
    let respond = await util.getRowdata()
    let jsonObj = new Object()
    let jsonstring
    jsonObj.records = respond
    jsonstring = JSON.stringify(jsonObj)
    res.send(jsonstring)
})

app.get("/createfolder", async (req, res) => {
    let allpoint = await map.get('point')
    let rows = await util.loadSheet()
    allpoint.forEach(pointid => {
        let rowindex
        for (let index = 0; index < rows.length; index++) {
            if (rows[index].IDdetect == allpoint) {
                rowindex = index
            } else {
                continue
            }
        }
        let folderlink = util.createFolder(pointid, rowindex)
    });
    res.sendStatus(200)
})



app.get('/testlistfile', async (req, res) => {
try{
    let allrows  = await util.loadSheet()
    let resp = await util.getfileid()

    for (let index = 0; index < allrows.length; index++) {
       let fileid = await util.getfileid(allrows[index].IDdetect)
         try{
            allrows[index].criminalimage =  fileid[0].id
          await allrows[index].save();
         } catch(err){
             console.log(index+" error")
         }
    }

    // resp.forEach(element => {
    //     let pointnamesplited = element.name.split('_')
    //     let pointname = pointnamesplited[0]
    //     let rowindex
    //     if (element.id != null && element.name!= null) {
    //         let imageid = element.id
    //         for (let index = 0; index < allrows.length; index++) {
    //             if(allrows[index].IDdetect == pointname)
    //             rowindex = index
    //         }
    //         try{
    //             let waitTill = new Date(new Date().getTime() + 2 * 1000);
    //             while(waitTill > new Date()){}               
    //             allrows[rowindex].criminalimage = imageid
    //            let result =  allrows[rowindex].save();
    //            console.log(rowindex+'Saved')
    //         }catch(err){
    //             console.log(rowindex+': '+err)
    //         }
           
           
    //     }
    // });
    res.send(resp)
}catch(err){
    console.error(err)
}
})


function initialload() {
    let agentConfig = fs.readFileSync('./public/assets/agentname.txt', { encoding: 'utf-8', flag: 'r' }).split(',')
    let pointConfig = fs.readFileSync('./public/assets/points.txt', { encoding: 'utf-8', flag: 'r' }).split(',')

    let mapsKey = new Map();
    mapsKey.set('agentname', agentConfig)
    mapsKey.set('point', pointConfig)

    return mapsKey
}

if (process.env.PORT == null || process.env.PORT == undefined) {
    app.listen(4000, (req, res) => console.log('app is running'))
} else {
    app.listen(process.env.PORT, (req, res) => console.log('app is running'))
}
