const express = require('express')
const app = express()
var ggsheet = require('./src/ggsheet')
var util = require('./src/fileUtil')
const fileupload = require('express-fileupload')
const jwt = require('jsonwebtoken')
const cor = require('cors')
const utilities = require('./src/utilities')
const firebasemodule = require('./src/firebaseModule')
const fs = require('fs')
const path = require('path')
const linenoti = require('./src/linenoti')
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}))
app.set('view engine', 'ejs')
app.use(cor())
app.use(express.static("public"))
app.use(express.static('data'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



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

app.post('/importlinedata', async (req, res) => {
    try {
        let opname = req.headers.authorization
        let linemsg = req.body
        console.log('line msg:' + Object.keys(linemsg)[0])
        console.log('opName:' + opname)
        let strlinemsg = Object.keys(linemsg)[0]
        let result = await utilities.splitLineBase(strlinemsg, opname)
        if (result != null) {
            if (result == true) {
                console.log('return 200')
                res.sendStatus(200)
            } else {
                console.log('return 500')
                res.sendStatus(500)
            }
        } else {
            console.log(result)
            res.sendStatus(500)
        }

    } catch (err) {
        console.log(err);
        res.send(err)
    }

})

app.post('/matchingtel', async (req, res) => {
    let imagesFolder = `./data/${req.body.opName}/targetImages`
    console.log('Matching tel')
    if (req.body.tel != undefined && req.body.opName != undefined && req.files != null) {
        try {
            firebasemodule.updateMatchingTel(req.body)
            fs.rename(req.files.filestore.tempFilePath, path.join(imagesFolder, req.body.tel + `_${req.body.name}_` + path.extname(req.files.filestore.name)), function (err) {
                if (err) throw err
                res.sendStatus(200)
            })
        } catch (err) {
            console.error(err)
            res.sendStatus(500)
        }
    } else {
        firebasemodule.updateMatchingTel(req.body)
        console.log('Add without image')
        res.sendStatus(200)
    }
})
app.post('/manualaddbase', async (req, res) => {
    let result = utilities.webSetOther(req.body)
    if (req.files != null) {
        let etcFolder = `./data/${req.body.opName}/homeImages`
        try {
            util.creatlocalfolder(req.body.opName)
            fs.rename(req.files.filestore.tempFilePath, path.join(etcFolder, req.body.tel + path.extname(req.files.filestore.name)), function (err) {
                if (err) throw err

            })
            if (result) res.sendStatus(200)
        } catch (err) {
            console.error(err)
            res.sendStatus(500)
        }
    }
})

app.post('/lineMonitor', async (req, res) => {
    console.log(req.body)
    let event = req.body.events[0]
    let msg = event.message.text
    let datenum = Date.now()
    let dateresult = new Date(datenum).toLocaleTimeString()
    let replyToken = event.replyToken
    let replysuccess = '\nบันทึกข้อมูลเรียบร้อยแล้ว \n Map_tracking:\nhttps://gunman.csd.go.th/opmanager/tracert/op_taiwai'
    let replyfalse = 'ไม่สามารถเพิ่มข้อมูลได้ กำลังทำการแก้ไข'
    if (msg.search("MSISDN") != -1) {
        console.log('Line incoming :' + dateresult)
        console.log(msg)
        let result = await utilities.splitLineBase(msg, 'op_taiwai')
        if (result != null) {
            if (result == true) {
                console.log('return 200')
                let distanceMsg = await utilities.lineTelDistance(msg)
                if (distanceMsg != '') {
                    replysuccess = distanceMsg.concat(replysuccess)
                    linenoti.linenoti(replyToken, replysuccess)
                } else {
                    linenoti.linenoti(replyToken, replysuccess)
                }
                res.sendStatus(200)
            } else {
                console.log('return 500')
                linenoti.linenoti(replyToken, replyfalse)
                res.sendStatus(500)
            }
        } else {
            console.log(result)
            res.sendStatus(500)
        }
    } 

})

app.post('/basejustify', async (req, res) => {
    console.log(req.body.rawBase)
    let result = await utilities.splitBaseMsgForWeb(req.body.rawBase, req.body.opname)
    console.log(result)
    res.send(JSON.stringify(result))
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

app.get('/retrievedata', async (req, res) => {
    let resp = await firebasemodule.getData(req.query.opName)
    res.send(resp)
})

app.post('/updateevidence', async (req, res) => {
    utilities.updateEvidence(req.body.opName, req.files.filestore, req.body.item)
    res.sendStatus(200)
})

app.post('/importexcel', async (req, res) => {
    const map = {
        'row': 'no',
        'target_search': 'searchNo',
        'target': 'targetNo',
        'name_target': 'targetName',
        'idcard': 'targetId',
        'pic': 'targetPic',
        'address': 'targetAddress'
    }
    if (req.files) {
        try {
            readXlsxFile(req.files.filestore.tempFilePath, { map }).then(({ rows }) => {
                rows.forEach(element => {
                    console.log('Process push target')
                    utilities.addNewTarget(req.body.opName, element)
                });
            })
            res.sendStatus(200)
        } catch (err) {
            console.error(err)
            res.sendStatus(500)
        }
    } else {
        console.log('file zero')
        res.sendStatus(500)
    }
})

app.post('/importgprs', async (req, res) => {
    const map = {
        'row': 'no',
        'Time Stamp': 'timeStamp',
        'Address': 'address',
        'name_target': 'targetName',
        'idcard': 'targetId',
        'pic': 'targetPic',
        'address': 'targetAddress'
    }
    if (req.files) {
        try {
            readXlsxFile(req.files.filestore.tempFilePath, { map }).then(({ rows }) => {
                rows.forEach(element => {
                    console.log('Process push target')
                    utilities.addNewTarget(req.body.opName, element)
                });
            })
            res.sendStatus(200)
        } catch (err) {
            console.error(err)
            res.sendStatus(500)
        }
    } else {
        console.log('file zero')
        res.sendStatus(500)
    }
})

app.post('/loginOp', async (req, res) => {
    let ispass = await firebasemodule.checkLogin(req.body.opName.toString().trim(), req.body.opPass.toString().trim())
    if (ispass) {
        let tokenStr = jwt.sign({ id: req.body.opName }, 'operationCSD', { expiresIn: 60 * 60 * 12 })
        res.status(200).send({ token: tokenStr })
    } else {
        res.status(200).send({ token: '' })
    }
})

app.post('/create-rtdb', async (req, res) => {
    if (req.body.opName != null && req.body.opPass != null) {
        let checkIsDBExist = await firebasemodule.checkIsDBExist(req.body.opName)
        if (checkIsDBExist == true) {
            console.log('already exist');
            res.status(200).send({ 'message': 'already exist' })
        } else if (checkIsDBExist == false) {
            let result = await firebasemodule.setNewRTDB(req.body.opName, req.body.opPass)
            if (result == true) {
                util.creatlocalfolder(req.body.opName)
                console.log('create operation success' + req.body.opName + "  passoword : " + req.body.opPass)
                res.status(200).send({ 'message': 'success' })
            } else {
                res.status(200).send({ 'message': result })
            }
        } else {
            res.send({ status: checkIsDBExist })
        }

    }
})
