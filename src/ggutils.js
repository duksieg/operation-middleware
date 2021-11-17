
const { google } = require('googleapis');
const fs = require('fs');
const ggsheet = require('./ggsheet');

const authcreds = new google.auth.GoogleAuth({
    keyFile: "./src/key.json", //the key file
    scopes: "https://www.googleapis.com/auth/drive",
});

const drive = google.drive({
    version: 'v3',
    auth: authcreds
});

module.exports ={

    getfileid: async function getfileid(IDdetect) {
        let parentid = '14IKnpv20XhDsKl4UTJqhm3mEjqRxH4Ik'
        let result
        try {
            let resp = await drive.files.list({
                q: `'${parentid}' in parents and name contains '${IDdetect}'`,
                mimeType: 'image/jpeg,image/png',
                spaces: 'drive'
            })
            // resp.data.files.forEach(element => {
            //     console.log(element)
            // });
            result = resp.data.files
            return result
        }
        catch (err) {
            console.error(err)
            return false
        }
    },
    getfolderid: async function getfolderid(IDdetect) {
        let parentid = '1fL0qQ7Kb4BV2R3UaQVtROqBiNsOhwHll'
        let result
        try {
            let resp = await drive.files.list({
                q: `'${parentid}' in parents and name contains '${IDdetect}'`,
                mimeType: 'application/vnd.google-apps.folder',
                spaces: 'drive',
            })
            // resp.data.files.forEach(element => {
            //     console.log(element)
            // });
            result = resp.data.files
            return result
        }
        catch (err) {
            console.error(err)
            return false
        }


    },
    getimages: async function getimages(parentid, defaultid) {
        if (parentid == null || parentid == undefined) parentid = defaultid
        let result
        try {
            let resp = await drive.files.list({
                q: `'${parentid}' in parents`,
                spaces: 'drive'
            })
            // resp.data.files.forEach(element => {
            //     console.log(element)
            // });
            result = resp.data.files
            return result
        }
        catch (err) {
            console.error(err)
            return false
        }

    },

    createFolder: async function createFolder(pointname, rowindex) {
        try {
            var fileMetadata = {
                'name': pointname,
                'parents': ['1HILztWrd42JypUEtXGqr8lNtbeYXbvb1'],
                'mimeType': 'application/vnd.google-apps.folder'
            };
            let res = await drive.files.create({
                resource: fileMetadata,
                fields: 'id,webViewLink'
            })
            let folderId = res.data.id
            let folderlink = res.data.webViewLink
            await this.updateFolderPermission(folderId)
            await this.updateRowfolderID(folderlink, rowindex)

            return folderlink

        } catch (err) {
            console.error(err)
            return false
        }

    },

    updateFolderPermission: async function updateFolderPermission(folderId) {

        try {
            const fileId = folderId;
            //change file permisions to public.
            await drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            //obtain the webview and webcontent links
            const result = await drive.files.get({
                fileId: fileId,
                fields: 'webViewLink, webContentLink',
            });
            return (result);
        } catch (error) {
            return (error);
        }

    },

    createimage: async function createImage(filename, filepath, mimetype, parentid) {
        try {
            await drive.files.create({
                requestBody: {
                    name: filename,
                    'parents': [parentid],
                },
                media: {
                    mimeType: mimetype,
                    body: fs.createReadStream(filepath),
                }
            });
            return true
        }
        catch (err) {
            console.error(err)
            return false
        }
    },

    sendimages: async function sendimages(placeid, status, files, folderId) {
        if (files != null || files != undefined) {
            if (Array.isArray(files)) {
                for (let index = 0; index < files.length; index++) {
                    let filenametosend = placeid + "_" + status + "_" + files[index].name
                    let filepath = files[index].tempFilePath
                    this.createimage(filenametosend, filepath, files[index].mimetype, folderId)
                }
            } else {  //if not array = 1file
                let filenametosend = placeid + "_" + status + "_" + files.name
                let filepath = files.tempFilePath
                this.createimage(filenametosend, filepath, files.mimetype, folderId)
            }
            return true
        } else {
            return false
        }
    },




}