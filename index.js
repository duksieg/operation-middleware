const express = require('express')
const app = express()
var util = require('./ggsheet')
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));




app.get("/", async (req, res) => {
        res.render('index')
})



app.post("/saverecord", async (req, res) => {
    if(util.updateRow(req.body)){
        res.sendStatus(200);
    }else{
        res.sendStatus(500);
    }
})

app.get("/info", async (req, res) => {
   let total =  await util.gettotalData()
   
    res.send(total)
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

app.listen(4000, (req, res) => console.log('running on 4000'))