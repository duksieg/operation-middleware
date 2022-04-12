const express = require('express')
const app = express()
var ggsheet = require('./src/ggsheet')
var util = require('./src/util')
const fileupload = require('express-fileupload')
const fs = require('fs')
const cor = require('cors')
const ggutils = require('./src/ggutils')
const utilities = require('./utilities')
const firebasemodule =require('./firebaseModule')
const { json, urlencoded } = require('body-parser')
const path = require('path')
app.set('view engine', 'ejs');
app.use(cor())
app.use(express.static("public"));
app.use(express.json())
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

app.get("/", async (req, res) => {
    res.render('index')
})

app.get('/operation', async (req, res) => {
    res.render('operationmain')
})

app.get('/operationform/', async (req, res) => {
    if (req.query['code'] != '') {
        let code = req.query['code'].toLocaleUpperCase()
        let loadpoint = await ggsheet.loadpoint(code)
        res.render('operation', { pointdata: loadpoint })
    } else {
        res.render('404')
    }

})
app.post('/importlinedata', async (req, res) => {
    try {
        let linemsg = req.body.linemsg
        //let linemsg = "66645494758		10:32:34Subscriber is on 4G/5G: YES    Source: Instant Geo    Latitude: 13.776    Longitude: 100.724    MSISDN: 66645494789    IMSI: 520002033042287    eCID: 41205962    TAC: 1077    LCID: 202    eNB: 160960    Operator Name: CAT Telecom Public Company    Home Country: Thailand    Home MCC: 520    Home MNC: 4    Roaming: NO    Last Collected Result:    24.03.2022 10:38:34"

        let pointObj = utilities.splitLineBase(linemsg)
        let result = firebasemodule.addNewPoint('targetNorman', pointObj)
        if (result) {
            res.sendStatus(200)
        }else{
            res.sendStatus(500)
        }
    } catch (err) {
        console.log(err);
        res.send(err)
    }

})

app.get('/casing', async (req, res) => {
    res.render('casingmain')
})

app.get('/casingform/', async (req, res) => {
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


app.post("/saverecord", async (req, res) => {
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
            if (req.files.imageetc != null) {
                util.createimage(req.files.imageetc, 'imageetc', code)
            }
        }

        let response = await ggsheet.updateCasingRow(req.body)
        if (response) {
            res.render('success')
        } else {
            res.render('failure', { reason: response })
        }
    } else {
        res.sendStatus('404')
    }

})

app.get('/personal', async (req, res) => {
    if (req.query['code'] != undefined) {
        let code = req.query['code'].toString().toUpperCase()
        let op_inform = await ggsheet.getopbyCode(code)
        let images_gg = await ggutils.getimages(op_inform.folderID)
        let slide = await ggutils.getslide(op_inform.folderID)
        let images_person = await util.getpersonimage(code)
        console.log(op_inform.headerValues)
        if (op_inform != null || op_inform != undefined) {
            res.render('personaldetail', { evidence: op_inform, images: images_gg, image_person: images_person, slide: slide })
        } else {
            res.render('notfound', { reason: 'ข้อมูลบางส่วนไม่สมบูรณ์' })
        }
    } else {
        res.render('personalmain')
    }
})

app.post('/emergency', async (req, res) => {
    if (req.body.code != null && req.body.code != undefined) {
        let setsos = ggsheet.setsos(req.body.code)
        if (setsos) {
            res.sendStatus(200)
        } else {
            res.sendStatus(500)
        }
    } else {
        res.sendStatus(500)
    }
})

app.get('/map', async (req, res) => {
    let data = await ggsheet.loadSheet('operation')
    res.render('map', { data: data })
})

app.get('/test', async (req, res) => {
    try {
        let reps = await util.getpersonimage('1C2')
        console.log(reps)
        res.send(reps)
    } catch (err) {
        console.error(err)
        res.status(500)
    }

})

app.get('/listfile/:code',async(req,res)=>{
    let code = req.params.code.toString().toLocaleUpperCase()
    try{
        let listfile = await util.listfileinFolder(code)
        if(listfile.length > 0){
            res.send(JSON.stringify(listfile))
        }else{
            res.sendStatus(404)
            
        }
    }catch(err){
        res.send(err)
    }
})

app.get("/buck/:code/:filename", async (req, res) => {
    let code = req.params.code
    let filename = req.params.filename

    fs.readFile(path.join('./data',code,filename), function(err, data) {
        if (err) {
            res.writeHead(404, 'Not Found');
            res.write(`404: File Not Found! at: ${path.join('./data',code,filename)}`);
            return res.end();
        }
        res.statusCode = 200;
        res.write(data);
        return res.end();
    });

})


// app.get("/detail", async (req, res) => {
//     let respond = await ggsheet.getRowdata()
//     let jsonObj = new Object()
//     let jsonstring
//     jsonObj.records = respond
//     jsonstring = JSON.stringify(jsonObj)
//     res.send(jsonstring)
// })