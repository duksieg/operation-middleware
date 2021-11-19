const express = require('express')
const app = express()
var ggsheet = require('./src/ggsheet')
var util = require('./src/util')
const fileupload = require('express-fileupload')
const { body, validationResult } = require('express-validator');
const fs = require('fs')
const cor = require('cors')
const ggutils = require('./src/ggutils')
app.set('view engine', 'ejs');
app.use(cor())
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));


function initialload() {

    if (process.env.PORT == null || process.env.PORT == undefined) {
        app.listen(3000, (req, res) => console.log('app is running on 3000'))
    } else {
        app.listen(process.env.PORT, (req, res) => console.log('app is running'))
    }
}



var map = initialload()

app.get("/", async(req, res) => {
    res.render('index')
})

app.get('/operation', async(req, res) => {
    res.render('operationmain')
})

app.get('/operationform/', async(req, res) => {
    if (req.query['code'] != '') {
        let code = req.query['code'].toLocaleUpperCase()
        let loadpoint = await ggsheet.loadpoint(code)
        res.render('operation', { pointdata: loadpoint })
    } else {
        res.render('404')
    }

})

app.get('/casing', async(req, res) => {
    res.render('casingmain')
})

app.get('/casingform/', async(req, res) => {
    if (req.query['code'] != '') {
        let code_id = req.query['code'].toLocaleUpperCase()
        let main_data = await ggsheet.getMainbyCode(code_id)
        let team_data = await ggsheet.getTeambyCode(code_id)
        if (main_data != null || main_data != undefined) {
            res.render('casing', { main: main_data, team: team_data })
        } else {
            res.render('404')
        }

    } else {
        res.render('404')
    }

})


app.post("/saverecord", async(req, res) => {
    let checkstatus
    try {
        if (req.body.placeid != null || req.body.placeid != '') {
            if (req.files != null) {
                checkstatus = await ggsheet.updateRow(req.body, req.files.filestore)
            } else {
                checkstatus = await ggsheet.updateRow(req.body, '')
            }

            if (checkstatus == true) {
                res.render('success')
            } else {
                res.render('failure', { reason: checkstatus })
            }
        } else {
            console.error('Placeid is null')
            res.render('failure', { reason: 'ไม่ได้ทำการกรอกรหัสจุดค้น' })
        }

    } catch (err) {
        console.error(res.checkstatus + " : " + err)
        res.render('failure', { reason: err })
    }
})

app.post('/casingrecord', async(req, res) => {

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
            if (req.files.imageetc != null) {
                util.createimage(req.files.imageetc, 'imageetc', code)
            }
        }

        let response = await ggsheet.updateCasingRow(req.body)
        if(response){
            res.render('success')
        }else{
            res.render('failure',{reason:response})
        }
    } else {
        res.sendStatus('404')
    }

})

app.get('/personal', async(req, res) => {
    if (req.query['code'] != undefined) {
        let code = req.query['code'].toString().toUpperCase()
        let op_inform = await ggsheet.getopbyCode(code)
        let images_gg = await ggutils.getimages(op_inform.folderID)
            //let slide = await ggutils.getslide(op_inform.folderID)
        let images_person = await util.getpersonimage(code)
        console.log(images_gg)
        if (op_inform != null || op_inform != undefined) {
            res.render('personaldetail', { evidence: op_inform, images: images_gg })
        } else {
            res.render('404')
        }
    } else {
        res.render('personalmain')
    }
})

app.get('/personal/:code', async(req, res) => {

})

app.get('/test', async(req, res) => {
    let resp
    try {
        let reps = await ggsheet.updateRowfolderID()
        res.send('ok')
    } catch (err) {
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