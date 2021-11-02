const fs = require('fs')
const path = require('path')
const folderdata = './data'

module.exports={

    creatlocalfolder:createlocalFolder = (foldername)=>{
        let folderpath = `./data/${foldername}`
        fs.rmdirSync(folderpath,{ recursive: true })
        fs.mkdirSync(folderpath,{recursive:true},(err)=>{
            if (err) console.error(err)
            else{
                return(true)
            }
        })
    },
    
    createlocalfile:createlocalfile = (filestore,nametag,code) =>{
        let foldername = path.join(path.dirname(__dirname),'/data',code)
        if(Array.isArray(filestore)){
            let index = 1
            filestore.forEach(element => {
                let filename = nametag+'_'+index+'_'+element.name
                console.log(element.data.toString())
                fs.copyFile( element.tempFilePath, path.join(foldername,filename), (err) => {
                    if (err) throw err;
                  });
                  index++
            });
        }else{
            let filename = nametag+'_'+filestore.name
            fs.copyFile(filestore.tempFilePath,path.join(foldername,filename), (err) => {
                if (err) throw err;
              });
        }
    },

    listfileinFolder : listfileinFolder = async (code)=>{
        let folderpath = path.join(folderdata,code)
        let arryfile = []
        let files = await fs.readdirSync(folderpath)
        files.forEach(file => {
            let file_path = path.join(folderpath,file)
            arryfile.push(file_path)
        });
        return arryfile
    },

    clearimages:clearimages = ()=>{

    },

    createimage:createimage = (filestore,nametag,code)=>{
        try{
            createlocalfile(filestore,nametag,code)
        }catch(err){
            console.error(`${nametag} upload images failed`)
            console.error(err)
        }
    }

}