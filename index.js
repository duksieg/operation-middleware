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
const fileUtil = require('./src/fileUtil')
const {logger} = require('./src/logConfig')
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

var evidencesListJson = ''


function initialload() {

    if (process.env.PORT == null || process.env.PORT == undefined) {
        app.listen(3000, (req, res) => logger.info('app is running on 3000'))
    }
    firebasemodule.getEvidence().then((result) => {
        evidencesListJson = result
    })

}


initialload()

app.get("/", async (req, res) => {
    res.render('index')
})
//Base Control
app.post('/importlinedata', async (req, res) => {
    try {
        let opname = req.headers.authorization
        let linemsg = req.body
        logger.info('line msg:' + Object.keys(linemsg)[0])
        logger.info('opName:' + opname)
        let strlinemsg = Object.keys(linemsg)[0]
        let result = await utilities.splitLineBase(strlinemsg, opname)
        if (result != null) {
            if (result == true) {
                logger.info('return 200')
                res.sendStatus(200)
            } else {
                logger.info('return 500')
                res.sendStatus(500)
            }
        } else {
            logger.info(result)
            res.sendStatus(500)
        }

    } catch (err) {
        logger.info(err);
        res.send(err)
    }

})

//Manage Base Control
app.post('/matchingtel', async (req, res) => {
    let imagesFolder = `./data/${req.body.opName}/targetImages`
    logger.info('Matching tel')
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
        logger.info('Add without image')
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
app.post('/basejustify', async (req, res) => {
    logger.info(req.body.rawBase)
    let result = await utilities.splitBaseMsgForWeb(req.body.rawBase, req.body.opname)
    logger.info(result)
    res.send(JSON.stringify(result))
})
//Monito line group for base control
app.post('/lineMonitor', async (req, res) => {
    logger.info(req.body)
    let event = req.body.events[0]
    let msg = event.message.text
    let datenum = Date.now()
    let dateresult = new Date(datenum).toLocaleTimeString()
    let replyToken = event.replyToken
    let replysuccess = '\nบันทึกข้อมูลเรียบร้อยแล้ว \n Map_tracking:\nhttps://gunman.csd.go.th/opmanager/tracert/op_taiwai'
    let replyfalse = 'ไม่สามารถเพิ่มข้อมูลได้ กำลังทำการแก้ไข'
    if (msg.search("MSISDN") != -1) {
        logger.info('Line incoming :' + dateresult)
        logger.info(msg)
        let result = await utilities.splitLineBase(msg, 'op_taiwai')
        if (result != null) {
            if (result == true) {
                logger.info('return 200')
                let distanceMsg = await utilities.lineTelDistance(msg)
                if (distanceMsg != '') {
                    replysuccess = distanceMsg.concat(replysuccess)
                    linenoti.linenoti(replyToken, replysuccess)
                } else {
                    linenoti.linenoti(replyToken, replysuccess)
                }
                res.sendStatus(200)
            } else {
                logger.info('return 500')
                linenoti.linenoti(replyToken, replyfalse)
                res.sendStatus(500)
            }
        } else {
            logger.info(result)
            res.sendStatus(500)
        }
    }

})

//Reporter
app.get('/reporter/evidence', async (req, res) => {
    logger.info('send evidence to client')
    res.send(evidencesListJson)
})
app.post('/reporter/evidence', async (req, res) => {
    let requestObj = req.body
    logger.info('incoming report : ')
    let updateResult =  firebasemodule.reportEvidence(requestObj)
    if(updateResult) res.send(JSON.stringify(updateResult))
    else res.sendStatus(400)
})
app.post('/reporter/wanted', async (req, res) => {
    let opname = req.body.opName
    let wantedobj = req.body.wantedobj
    let wantedObj  = JSON.parse(wantedobj)
    let updateResult =  firebasemodule.reportWanted(wantedObj,opname)
    if(updateResult) res.send(JSON.stringify(updateResult))
    else res.sendStatus(400)
})
app.post('/reporter/emergency', async (req, res) => {
    if (req.body.opName == null && req.body.pointcode == null) {
      res.sendStatus(500)
    } else {
        let setsos =firebasemodule.reportsos(req.body.opName,req.body.pointcode)
        if(setsos) res.sendStatus(200)
        else res.sendStatus(500)
    }
})

//Manage Operaion
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
            logger.info('already exist');
            res.status(200).send({ 'message': 'already exist' })
        } else if (checkIsDBExist == false) {
            let result = await firebasemodule.setNewRTDB(req.body.opName, req.body.opPass)
            if (result == true) {
                util.creatlocalfolder(req.body.opName)
                logger.info('create operation success' + req.body.opName + "  passoword : " + req.body.opPass)
                res.status(200).send({ 'message': 'success' })
            } else {
                res.status(200).send({ 'message': result })
            }
        } else {
            res.send({ status: checkIsDBExist })
        }

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
app.post('/manage/addwantedlist', async (req, res) => {
    let imagefilename = await fileUtil.createTargetImage(req.files.targetImage, req.body.opName, req.body.targetID)
    const wantedObj = {
        targetName: req.body.targetName == null ? '' : req.body.targetName,
        targetPic: imagefilename == null ? '' : imagefilename,
        allegation: req.body.allegation == null ? '' : req.body.allegation,
        status: '',
        idcard:req.body.targetID == null ? '' : req.body.targetID,
        pointfound:'',
    }
    let appendedResult = await firebasemodule.addWanted(req.body.opName, wantedObj)
    if (appendedResult) res.sendStatus(200)
    else res.sendStatus(500)
})
// serving list of files
app.get('/operation/getimages/:opname/:pointcode', async (req, res) => {
    let opName = req.params.opname
    let pointcode = req.params.pointcode
    logger.info(`Serving point images : ${pointcode}`)
    try {
        let pointfolder = path.join(__dirname, `data/${opName}/${pointcode}`)
        logger.info('Looking for ' + pointfolder)
        let pointImages = fs.readdirSync(pointfolder)
        res.send(pointImages).status(200)
    } catch (err) {
        logger.error(err)
        res.sendStatus(500)
    }
})
//serving file for pdf
app.get('/operation/image/:opname/:pointcode/:filename', async (req, res) => {
    let opName = req.params.opname
    let filename = req.params.filename
    let pointcode = req.params.pointcode
    let filepath = path.join(__dirname, `data/${opName}/${pointcode}/${filename}`)
    logger.info('serving file : ' + filepath)
    res.sendFile(filepath)
})
//serving wandted list images
app.get('/operation/targetimages/:opname/:file', async (req, res) => {
    let opName = req.params.opname
    let filename = req.params.file
    let filepath = path.join(__dirname, `data/${opName}/targetImages/${filename}`)
    logger.info('serving image : ' + filepath)
    res.sendFile(filepath)
})



// app.post('/importexcel', async (req, res) => {
//     const map = {
//         'row': 'no',
//         'target_search': 'searchNo',
//         'target': 'targetNo',
//         'name_target': 'targetName',
//         'idcard': 'targetId',
//         'pic': 'targetPic',
//         'address': 'targetAddress'
//     }
//     if (req.files) {
//         try {
//             readXlsxFile(req.files.filestore.tempFilePath, { map }).then(({ rows }) => {
//                 rows.forEach(element => {
//                     logger.info('Process push target')
//                     utilities.addNewTarget(req.body.opName, element)
//                 });
//             })
//             res.sendStatus(200)
//         } catch (err) {
//             console.error(err)
//             res.sendStatus(500)
//         }
//     } else {
//         logger.info('file zero')
//         res.sendStatus(500)
//     }
// })

// app.post('/importgprs', async (req, res) => {
//     const map = {
//         'row': 'no',
//         'Time Stamp': 'timeStamp',
//         'Address': 'address',
//         'name_target': 'targetName',
//         'idcard': 'targetId',
//         'pic': 'targetPic',
//         'address': 'targetAddress'
//     }
//     if (req.files) {
//         try {
//             readXlsxFile(req.files.filestore.tempFilePath, { map }).then(({ rows }) => {
//                 rows.forEach(element => {
//                     logger.info('Process push target')
//                     utilities.addNewTarget(req.body.opName, element)
//                 });
//             })
//             res.sendStatus(200)
//         } catch (err) {
//             console.error(err)
//             res.sendStatus(500)
//         }
//     } else {
//         logger.info('file zero')
//         res.sendStatus(500)
//     }
// })

