const firebase = require('firebase/app');
const { child, set, ref, push,update } = require('firebase/database');
const { createLogger, format, transports } = require('winston');
const firebasedb = require('firebase/database')
const fs = require('fs');
const logger = createLogger({
    level: 'info',
    format: format.simple(),
    // You can also comment out the line above and uncomment the line below for JSON format
    // format: format.json(),
    transports: [
        new transports.File({
            filename: 'operationProcess.log',
            level: 'info'
        }),
        new transports.Console({
            level: 'info',
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        })]
});

const firebaseConfig = {
    apiKey: "AIzaSyCXGu-CH89dMLCWH7tugLG0Vb51wPaoA_c",
    authDomain: "operation-333705.firebaseapp.com",
    databaseURL: "https://operation-333705-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "operation-333705",
    storageBucket: "operation-333705.appspot.com",
    messagingSenderId: "995869264631",
    appId: "1:995869264631:web:9331079e9606ef2644a1f2"
};
const initializeApp = firebase.initializeApp(firebaseConfig)
const rtdb = firebasedb.getDatabase(initializeApp)

function setNewRTDB(in_name, pass) {
    try {
        firebasedb.set(firebasedb.ref(rtdb, in_name),
            {
                property: in_name,
                password: pass,
                data:'',
                wantedlist:'',
                points: '',
            })
        return true
    } catch (error) {
        return error
    }
}

function createNewDB(in_name) {
    try {
        firebasedb.set(firebasedb.ref(rtdb, `/${in_name}`),
            {
                points: ''
            })
        return true
    } catch (error) {
        return error
    }
}



async function cleanDB(opName) {
    try {
        await firebasedb.set(firebasedb.ref(rtdb, opName + '/targets'),
            {})
        logger.info('clean db success');
        return true
    } catch (error) {
        return error
    }
}

async function checkIsDBExist(opName) {
    const rtdb_ref = firebasedb.ref(rtdb)
    try {
        let result = await firebasedb.get(child(rtdb_ref, opName))
        if (result.exists()) {
            return true
        } else {
            return false
        }
    } catch (err) {
        logger.error(err);
        return err
    }
}

function snapshotToArray(snapshot) {
    var returnArr = [];
    snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.key === 'targets') {
            childSnapshot.forEach(element => {
                var item = element.val();
                item.key = element.key;
                returnArr.push(item);
            });
        }

    });

    return returnArr;
};

async function getData(opName) {
    const rtdb_ref = firebasedb.ref(rtdb)
    try {
        let result = await firebasedb.get(child(rtdb_ref, opName))
        if (result.exists()) {
            return snapshotToArray(result)
        } else {
            return false
        }
    } catch (err) {
        logger.error(err);
        return err
    }
}


async function checkLogin(opName, pass) {
    const rtdb_ref = firebasedb.ref(rtdb)
    try {
        let result = await firebasedb.get(child(rtdb_ref, opName))
        if (result.exists()) {
            op_prop = result.val()
            if (op_prop.password == pass) {
                return true
            }
        } else {
            logger.info('not found for op ' + opName)
            return false
        }
    } catch (err) {
        logger.error(err);
        return error
    }
}


async function addNewTarget(opName, dataObj) {
    let cleaned = await cleanDB(opName)
    if (cleaned) {
        firebasedb.push(firebasedb.ref(rtdb, opName + '/targets'), {
            no: dataObj.no !== undefined ? dataObj.no : '',
            targetSearch: dataObj.targetSearch !== undefined ? dataObj.targetSearch : '',
            targetNo: dataObj.targetNo !== undefined ? dataObj.targetNo : '',
            targetName: dataObj.targetName !== undefined ? dataObj.targetName : '',
            targetId: dataObj.targetId !== undefined ? dataObj.targetId : '',
            address: dataObj.targetAddress !== undefined ? dataObj.targetAddress : ''
        })
        logger.info('Target No :' + dataObj.no + 'push success');
    }

}

async function addNewPoint(opName, dataObj) {
    const rtdb_point = firebasedb.ref(rtdb, `${opName}/points/`)
    const rtdb_tel = firebasedb.ref(rtdb, `${opName}/points/${dataObj.MSISDN}`)
    let status
    try {
        let result = await firebasedb.get(child(rtdb_point, dataObj.MSISDN))
        if (result.exists()) {
            logger.info('found tel number' + dataObj.MSISDN)
            try{
                let resultpush = await push(rtdb_tel, dataObj)
                status=true
            }catch(err){
                logger.error(err)
                status=false
            }

        } else {
            logger.info('not found for tel ' + dataObj.MSISDN)
            firebasedb.push(rtdb_tel, dataObj)
            status = true
        }
    } catch (err) {
        logger.error(err);
        status = false
    }
    return status
}

async function addNewHome(opName, dataObj) {
    const rtdb_point = firebasedb.ref(rtdb, `${opName}/points/`)
    const rtdb_home = firebasedb.ref(rtdb, `${opName}/points/home`)
    let status
    try {
        let result = await firebasedb.get(child(rtdb_point,'home'))
        if (result.exists()) {
            try{
                firebasedb.push(rtdb_home, dataObj)
                logger.info('push success')
                status=true
            }catch(err){
                logger.error(err)
                status=false
            }

        } else {
            logger.info('not found for home ')
            firebasedb.push(rtdb_home, dataObj)
            status = true
        }
    } catch (err) {
        logger.error(err);
        status = false
    }
    return status
}

async function addManual(opName, tel,dataObj) {
    const rtdb_point = firebasedb.ref(rtdb, `${opName}/points/`)
    const rtdb_tel = firebasedb.ref(rtdb, `${opName}/points/${tel}`)
    let status
    try {
        let result = await firebasedb.get(child(rtdb_point, tel))
        if (result.exists()) {
            pointObj = result.val()
            logger.info('found tel number' + tel)
            try{
                let resultpush = await push(rtdb_tel, dataObj)
                status=true
                logger.info(resultpush);
            }catch(err){
                logger.error(err)
                status=false
            }

        } else {
            logger.info('not found for tel ' + tel)
            firebasedb.push(rtdb_tel, dataObj)
            status = true
        }
    } catch (err) {
        logger.error(err);
        status = false
    }
    return status
}

async function updateMatchingTel(dataObj) {
    const rtdb_tel = firebasedb.ref(rtdb, `${dataObj.opName}/points/${dataObj.tel}`)
    const updateMatching = {
        targetname:dataObj.name
    }
    try {
        let resultupdate = update(rtdb_tel,updateMatching)
        logger.info(await resultupdate)
    } catch (err) {
        logger.error(err);
    }
}

async function updateEvidence(dataArry,type){
     dataArry ={'ammo_11':'กระสุน 11mm','ammo_22':'กระสุน 0.22','ammo_357':'กระสุน 0.357','ammo_38':'กระสุน 0.38','ammo_556':'กระสุน 0.556','ammo_762':'กระสุน 0.762','ammo_9':'กระสุน 9mm','ammo_air':'กระสุนอัดอากาศ','ammo_shortgun':'กระสุนลูกซอง'}
    //dataArry={'ammu_barrel':'ลำกล้อง','ammu_explosive':'วัตถุระเบิด','ammu_magazine':'แม็คกาซีน','ammu_scope':'ชุดเล็ง','ammu_silencer':'ลำกล้องเก็บเสียง','ammu_trigger':'ชุดลั่นไก'} 
    type ='ammunition'
    const rtdb_evidence = firebasedb.ref(rtdb,`evidence/${type}`)
    try{
        let resultupdate = set(rtdb_evidence,dataArry)
        logger.info(await resultupdate)
    }catch(err){
        logger.error(err)
    }
}
async function addWanted(opName,objWanted){
    const rtdb_wantedlist = firebasedb.ref(rtdb,`${opName}/wantedlist`)
   
    try{
        let appendedResult = firebasedb.push(rtdb_wantedlist,objWanted)
        if(appendedResult){
            logger.info('appended wanted list successfull')
        }
    }catch(err){
        logger.error(err)
    }
}

async function gatherPlaces(opName){
    const rtdb_ref = firebasedb.ref(rtdb,`${opName}/points/home`)
    let allplaces 
    try {
        let result =  await firebasedb.get(rtdb_ref)
        if (result.exists()) {
            allplaces = result.val()
            return allplaces
        } else {
            logger.info('not found for op ' + opName)
            return false
        }
    } catch (err) {
        logger.error(err);
        return false
    } 
  }

async function getEvidence(){
    const rtdb_ref = firebasedb.ref(rtdb,`evidence`)
    let evidences 
    try {
        let result =  await firebasedb.get(rtdb_ref)
        if (result.exists()) {
            evidences = result.val()
            return evidences
        } else {
            logger.info('not found for op ' + opName)
            return false
        }
    } catch (err) {
        logger.error(err);
        return false
    } 
}



module.exports = { addWanted,setNewRTDB, addNewTarget, checkIsDBExist, checkLogin, getData, createNewDB, addNewPoint,addNewHome,addManual,gatherPlaces,updateMatchingTel,getEvidence,updateEvidence} 
