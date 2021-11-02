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
app.use(express.urlencoded({ extended: true }));
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));


var map = initialload()

app.get("/", async (req, res) => {
    res.render('index', { point: map.get('point'), agent: map.get('agentname') })
})

app.get('/casing',async (req,res)=>{
    res.render('casingmain')
})

app.get('/casingform/', async (req,res) => {
    let code_id = req.query['code']
    let main_data = await ggsheet.getMainbyCode(code_id)
    let team_data = await ggsheet.getTeambyCode(code_id)
    res.render('casing',{ main: main_data, team: team_data})
})


app.post("/saverecord", async (req, res) => {
    let checkstatus
    try{
        checkstatus = await ggsheet.updateRow(req.body, req.files.filestore)
        if (checkstatus == true) {
            res.render('success')
        } else if (checkstatus == 'notmatch') {
            res.render('notmatch', { reason: 'รหัสจุดค้น และ ชื่อหัวหน้าชุด ไม่ตรงกับในระบบ' })
        } else {
            res.render('notmatch', { reason: checkstatus })
        }
    }catch(err){
        console.error(res.checkstatus+" : "+err)
        res.render('notmatch', { reason: err })
    }
})

app.post('/casingrecord', async (req,res)=>{

    // console.log(req.body)
    // console.log(req.files)
    let code = req.body.code
    code.toString().toUpperCase()
    if(req.body !=null && req.body.code !=null){
        util.creatlocalfolder(code)

        if(req.files != null){
            if(req.files.image14 != null){
                util.createimage(req.files.image14,'image14',code)
            }
            if(req.files.personalimage14 != null){
                util.createimage(req.files.personalimage14,'personalimage14',code)
            }
            if(req.files.maptohome != null){
                util.createimage(req.files.maptohome,'maptohome',code)
            }
            if(req.files.imagehome != null){
                util.createimage(req.files.imagehome ,'imagehome',code)
            }
            if(req.files.imagemobile != null){
                util.createimage(req.files.imagemobile,'imagemobile',code)
            }
        }
        
        let response = await ggsheet.updateCasingRow(req.body)
        res.sendStatus(200)
    }else{
        res.sendStatus('404')
    }
    
})

// })

// app.get("/info", async (req, res) => {
//     let total = await ggsheet.gettotalData()
//     res.send(total)
// })



app.get('/test',async (req,res)=>{
    let resp = util.listfileinFolder('1C1')
    res.send(resp)
})


// app.get("/detail", async (req, res) => {
//     let respond = await ggsheet.getRowdata()
//     let jsonObj = new Object()
//     let jsonstring
//     jsonObj.records = respond
//     jsonstring = JSON.stringify(jsonObj)
//     res.send(jsonstring)
// })



// app.get("/createslide",async (req,res)=>{
//     let respond = await ggsheet.getRowdata()
//     let jsonrecords = respond
//     for (let index = 0; index < 2; index++) {
//         const element = jsonrecords[index]; 
//         let newslideid  
//         try{
//             newslideid = await updateslide.dupslide(element)
//             let response = await updateslide.replacetemplate(element,newslideid)
//         }catch(err){
//             console.error(element.pointno+'error :'+ err)
//         }
//     }
//     res.sendStatus(200)

// })
// app.get('/arrange',async (req,res)=>{
//     let temparry = []
//   let agname =  map.get('agentname')
//   agname.forEach(element => {
//       if(!temparry.includes(element)){
//           temparry.push(element)
//       }
//   });
//   res.send(temparry)
// })

// app.get("/createfolder", async (req, res) => {
//     let allpoint = await map.get('point')
//     let rows = await ggsheet.loadSheet()
//     allpoint.forEach(pointid => {
//         let rowindex
//         for (let index = 0; index < rows.length; index++) {
//             if (rows[index].IDdetect == allpoint) {
//                 rowindex = index
//             } else {
//                 continue
//             }
//         }
//         let folderlink = ggsheet.createFolder(pointid, rowindex)
//     });
//     res.sendStatus(200)
// })
// app.get('/testlistfile', async (req, res) => {
// try{
//     let allrows  = await ggsheet.loadSheet()
//     let resp = await ggsheet.getfileid()
    
//     for (let index = 0; index < allrows.length; index++) {
//        let fileid = await ggsheet.getfileid(allrows[index].IDdetect)
//          try{
//             allrows[index].criminalimage =  fileid[0].id
//           await allrows[index].save();
//          } catch(err){
//              console.log(err)
//          }
//     }
//     res.send(resp)
// }catch(err){
//     console.error(err)
// }
// })

// app.get('/testlistfolder', async (req, res) => {
//     let ggdrive = 'https://drive.google.com/drive/folders/'
//     let resp
//     try{
//         let allrows  = await ggsheet.loadSheet()
//         for (let index = 0; index < allrows.length; index++) {
//            let folderid = await ggsheet.getfolderid(allrows[index].IDdetect)
//              try{
//                 setTimeout(() => 5000);
//                 allrows[index].folderID =  ggdrive+folderid[0].id
//               await allrows[index].save();
//              } catch(err){
//                  console.log(err)
//              }
//         }
//         res.send(resp)
//     }catch(err){
//         console.error(err)
//     }
//     })



function initialload() {
    fs.mkdirSync('data',{recursive:true},(err)=>{
        if (err) console.error(err)
    })
}

if (process.env.PORT == null || process.env.PORT == undefined) {
    app.listen(4000, (req, res) => console.log('app is running'))
} else {
    app.listen(process.env.PORT, (req, res) => console.log('app is running'))
}
