//var slideutil = require('./updateslide')

// const { run } = require('googleapis/build/src/apis/run')

//var g_def= require('./ggsheet.js')
const g_def= require('./g_def.js')
run = async ()=>{
    [getrows,teamList]= await g_def.loadsheet()
    console.log(getrows)
    for (let i in getrows){
        folderCode_Id= await g_def.getfolderid(getrows[i].code)
        //create folder
        folderCode_Id.length==0 ? folderId=await createFolder(getrows[+i]['รหัสเป้า']):folderId=folderCode_Id[0].id
            
            
        
        //listfile
        filelist_drive=await g_def.listfile(folderId)
        filelist_shooter=[]
        await g_def.listfileinFolder(getrows[i].code).then((val)=>filelist_shooter=val);
        
        //chk_file_slide_in_folder
        arr_mime=getspc_mime(filelist)
        if (arr_mime.length>0){
            // date_created=arr_mime[0].name.split("_")[arr_mime[0].name.split("_").length-1]
            // if (getrows[i].date_changed != date_created){
            // //create new slide
            // idslide= await dupslide(folderId,`${getrows[i].code}_${getrows[i].date_changed}`)
            // //repalceData
            // resreplace= await replacetemplate(getrows[i], idslide,getspc_img(filelist,'person')[0].thumbnailLink,getspc_img(filelist,'tr14')[0].thumbnailLink)
            resdel=g_def.deleteobj(arr_mime[0].id)
        }

        //create new present
        idpresent= await dupslide(folderId,`${getrows[i].code}_${getrows[i].date_changed}`)
        //repalceData
        resreplace = await replacetemplate(
        getrows[i],
        idpresent,
        getspc_img(filelist_shooter, "personalimage14")[0].thumbnailLink,
        getspc_img(filelist_shooter, "image14")[0].thumbnailLink,
        getspc_img(filelist_shooter, "maptohome")[0].thumbnailLink,
        getspc_img(filelist_shooter, "imagehome")[0].thumbnailLink,
        teamList[i]
        );
        //chk_lenOFimgMap&create slide
        arrImg_map=getspc_img(filelist_shooter,'maptohome')
        for (i in arrImg_map){
            [idmap_copy,idsrc_slide]=await g_def.copyslide(idpresent,'maptohome')
            res=await g_def.replaceimg(idpresent,idmap_copy,'{{image-map}}',arrImg_map[i].thumbnailLink)
        }
        res=await g_def.deleteobj(idpresent,idsrc_slide)
        //chk_lenOFimgMap&create slide
        arrImg_map=getspc_img(filelist_shooter,'imagehome')
        for (i in arrImg_map){
            [idhome_copy,idsrc_slide]= await g_def.copyslide(idpresent,'imagehome')
            res= await g_def.replaceimg(idpresent,idhome_copy,'{{image-home}}',arrImg_map[i].thumbnailLink)
        }
        res=await g_def.deleteobj(idpresent,idsrc_slide)
        //chk_lenOFimgMap&create slide
        arrImg_map=getspc_img(filelist_shooter,'imagemobile')
        for (i in arrImg_map){
            [idhome_copy,idsrc_slide]= await g_def.copyslide(idpresent,'imagemobile')
            res= await g_def.replaceimg(idpresent,idhome_copy,'{{image-car}}',arrImg_map[i].thumbnailLink)
        }
        res=await g_def.deleteobj(idpresent,idsrc_slide)
        //chk_lenOFimgMap&create slide
        arrImg_map=getspc_img(filelist_shooter,'imageetc')
        for (i in arrImg_map){
            [idhome_copy,idsrc_slide]= await g_def.copyslide(idpresent,'imageetc')
            res= await g_def.replaceimg(idpresent,idhome_copy,'{{image-etc}}',arrImg_map[i].thumbnailLink)
        }
        res=await g_def.deleteobj(idpresent,idsrc_slide)

        
        
            

        
        
        //check folder

    }
}
run()
// folderCode_Id= await g_def.getfolderid('1A2')
// check_img=await g_def.getimages(folderId)
// check_img.length
// arrImg_map=getspc_img(check_img,'map')
// arrImg_home=getspc_img(check_img,'home')
//1rP3pPwSEpz9ZJBTgb4VF3kKvN1unzTeRf4XDuUH0YaE