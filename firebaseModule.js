const firebase = require('firebase/app');
const { child, set, ref, push } = require('firebase/database');
const firebasedb = require('firebase/database')
const fs = require('fs')


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
        console.log('clean db success');
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
        console.error(err);
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
        console.error(err);
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
            console.log('not found for op ' + opName)
            return false
        }
    } catch (err) {
        console.error(err);
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
        console.log('Target No :' + dataObj.no + 'push success');
    }

}

async function addNewPoint(opName, dataObj) {
    const rtdb_point = firebasedb.ref(rtdb, `${opName}/points/`)
    const rtdb_tel = firebasedb.ref(rtdb, `${opName}/points/${dataObj.tel}`)
    try {
        let result = await firebasedb.get(child(rtdb_point, dataObj.tel))
        if (result.exists()) {
            pointObj = result.val()
            console.log('found tel number' + dataObj.tel)
            push(rtdb_tel, dataObj).then(() => {
                console.log('update success')
                return true
            }).catch((error) => {
                console.log(error)
                return false
            });


        } else {
            console.log('not found for tel ' + dataObj.tel)
            firebasedb.push(rtdb_tel, dataObj)
            return true
        }
    } catch (err) {
        console.error(err);
        return false
    }
}




module.exports = { setNewRTDB, addNewTarget, checkIsDBExist, checkLogin, getData, createNewDB, addNewPoint } 
