const express = require('express')
const app = express()
var util = require('./ggsheet')
const fileupload = require('express-fileupload')
const fs = require('fs')
const cor = require('cors')
app.set('view engine', 'ejs');
app.use(cor())
app.use(express.urlencoded({ extended: true }));
app.use(fileupload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

var map = initialload()

app.get("/", async (req, res) => {
        res.render('index',{point:map.get('point'),agent:map.get('agentname')})
})


app.post("/saverecord",async (req, res) => {
    if(await util.updateRow(req.body,req.files.filestore)){
        res.render('success')
    }else{
        //wait for popup false
    res.sendStatus(200)
     }
})

app.get("/info", async (req, res) => {
   let total =  await util.gettotalData()
    res.send(total)
})

app.post("/imagesbyuser",async (req,res)=>{
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


app.get("/detail",async (req,res)=>{
    let respond = await util.getRowdata()
    let jsonObj = new Object()
    let jsonstring
    jsonObj.records = respond
    jsonstring = JSON.stringify(jsonObj)
    res.send(jsonstring)
})

app.get("/pointsdata", async (req, res) => {
    const jsonparsing = '{"data":[ {"pointName":"นายดำ นามสมมุติ","pointLatlng":"100.54231,13.22214"},{"pointName":"นายดำ รสจันะนั","pointLatlng":"100.54331,13.22214"}]}'
    const jsonObj = JSON.parse(jsonparsing)

    res.send(jsonObj)
})

function initialload(){
    let agentConfig = fs.readFileSync('./public/assets/agentname.txt',{encoding:'utf-8',flag:'r'}).split(',')
    let pointConfig = fs.readFileSync('./public/assets/points.txt',{encoding:'utf-8',flag:'r'}).split(',')

    let mapsKey = new Map();
     mapsKey.set('agentname',agentConfig)
     mapsKey.set('point',pointConfig)

     return mapsKey
}

app.listen(process.env.PORT ? 4000:process.env.PORT , (req, res) => console.log('running on 4000'))