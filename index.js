const express = require('express')
const app = express()
var ggsheet = require('./src/ggsheet')
var util = require('./src/util')
const fileupload = require('express-fileupload')
const { body, validationResult } = require('express-validator');
const fs = require('fs')
const cor = require('cors')
app.set('view engine', 'ejs');
app.use(cor())
app.use( express.static( "public" ) );
app.use(express.urlencoded({ extended: true }));
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));


function initialload() {
    fs.mkdirSync('data', { recursive: true }, (err) => {
        if (err) console.error(err)
    })
   
    if (process.env.PORT == null || process.env.PORT == undefined) {
        app.listen(3000, (req, res) => console.log('app is running on 3000'))
    } else {
        app.listen(process.env.PORT, (req, res) => console.log('app is running'))
    }
}



var map = initialload()

app.get("/", async (req, res) => {
    let loadpoint = await ggsheet.loadpoint()
    res.render('index',{point:loadpoint.code,agent:loadpoint.headteam})
})

app.get('/casing', async (req, res) => {
    res.render('casingmain')
})

app.get('/casingform/', async (req, res) => {
    if (req.query['code'] != '') {
        let code_id = req.query['code']
        let main_data = await ggsheet.getMainbyCode(code_id)
        let team_data = await ggsheet.getTeambyCode(code_id)
        if (main_data != null || main_data != undefined) {
            res.render('casing', { main: main_data, team: team_data })
        }else{
            res.render('404')
        }

    } else {
        res.render('404')
    }

})


app.post("/saverecord", async (req, res) => {
    let checkstatus
    console.log(req.body)
    try {
        if(req.files != null){
            checkstatus = await ggsheet.updateRow(req.body, req.files.filestore)
        }else{
            checkstatus = await ggsheet.updateRow(req.body, '')
        }
        if (checkstatus == true) {
            res.render('success')
        } else if (checkstatus == 'notmatch') {
            res.render('notmatch', { reason: 'รหัสจุดค้น และ ชื่อหัวหน้าชุด ไม่ตรงกับในระบบ' })
        } else {
            res.render('notmatch', { reason: checkstatus })
        }
    } catch (err) {
        console.error(res.checkstatus + " : " + err)
        res.render('notmatch', { reason: err })
    }
})

app.post('/casingrecord', async (req, res) => {

    console.log(req.body)
    // console.log(req.files)
    let code = req.body.code
    code.toString().toUpperCase()
    if (req.body != null && req.body.code != null) {
        util.creatlocalfolder(code)

        if (req.files != null) {
            if (req.files.image14 != null) {
                util.createimage(req.files.image14, 'image14', code)
            }
            if (req.files.personalimage14 != null) {
                util.createimage(req.files.personalimage14, 'personalimage14', code)
            }
            if (req.files.maptohome != null) {
                util.createimage(req.files.maptohome, 'maptohome', code)
            }
            if (req.files.imagehome != null) {
                util.createimage(req.files.imagehome, 'imagehome', code)
            }
            if (req.files.imagemobile != null) {
                util.createimage(req.files.imagemobile, 'imagemobile', code)
            }
            if(req.files.imageetc != null){
                util.createimage(req.files.imageetc,'imageetc',code)
            }
        }

        let response = await ggsheet.updateCasingRow(req.body)
        res.sendStatus(200)
    } else {
        res.sendStatus('404')
    }

})



app.get('/test', async (req, res) => {
    let resp
    try{
        resp = await ggsheet.gettotalcolumn()
    }catch(err){
        console.error(err)
    }
    
    res.send('ok')
})


// app.get("/detail", async (req, res) => {
//     let respond = await ggsheet.getRowdata()
//     let jsonObj = new Object()
//     let jsonstring
//     jsonObj.records = respond
//     jsonstring = JSON.stringify(jsonObj)
//     res.send(jsonstring)
// })





