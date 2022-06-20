const fs = require('fs')
const path = require('path')
const folderdata = './data'

module.exports = {

    creatlocalfolder: createlocalFolderFunc = (foldername) => {
        if (fs.existsSync(`data/${foldername}`)) {
            console.log('found local folder path')
            return true
        } else {
            dirs = [
                `./data/${foldername}`,
                `./data/${foldername}/targetImages`,
                `./data/${foldername}/homeImages`,
                `./data/${foldername}/cdr`,
                `./data/${foldername}/etc`
            ]
            dirs.forEach(dir => {
                fs.mkdirSync(dir, { recursive: true }, (err) => {
                    if (err) console.error(err)
                })
            });
            return true
        }
    },

    createlocalfile: createlocalfile = (filestore, nametag, code) => {
        let foldername = path.join(path.dirname(__dirname), '/data', code)
        let currenttime = Date.now()

        if (Array.isArray(filestore)) {
            let index = 1
            filestore.forEach(element => {
                let filename = nametag + index + '_' + currenttime + '_' + element.name
                console.log(element.data.toString())
                fs.copyFile(element.tempFilePath, path.join(foldername, filename), (err) => {
                    if (err) throw err;
                });
                index++
            });
        } else {
            let filename = nametag + '_' + currenttime + '_' + filestore.name
            fs.copyFile(filestore.tempFilePath, path.join(foldername, filename), (err) => {
                if (err) throw err;
            });
        }
    },

    listfileinFolder: listfileinFolder = async (code) => {
        let folderpath = path.join(folderdata, code)
        let arryfile = []
        let files = await fs.readdirSync(folderpath)
        files.forEach(file => {
            let file_path = path.join(folderpath, file)
            arryfile.push(file_path)
        });
        return arryfile
    },

    getcontentfile: getcontentfile = async (code, filename) => {
        let filepath = path.join(folderdata, code, filename)

        fs.readFile(filepath, function (err, data) {
            if (data != null) {
                console.log(data)
                return data;
            } else if (err) {
                console.error(err)
                return false
            }
        });

    },

    renamefiles: renamefiles = async (op_name) => {
        let folderpath = (`${op_name}/`)
        let files = await fs.readdirSync(folderpath)
        try {
            for (let index = 0; index < files.length; index++) {
                const element = files[index];
                console.log(folderpath + element)
                console.log(folderpath + index)
                fs.rename(folderpath + element, folderpath + index)
            }
        } catch (err) {

        }

    },


    createimage: createimage = (filestore, nametag, code) => {
        try {
            createlocalfile(filestore, nametag, code)
        } catch (err) {
            console.error(`${nametag} upload images failed`)
            console.error(err)
        }
    }

}