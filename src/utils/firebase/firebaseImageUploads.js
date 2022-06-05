const admin = require("./firebaseAdmin")
const {v4: uuidv4} = require("uuid");
const catchAsync = require("../response/catchAsync");
const uuid = require("uuid");
const sharp = require("sharp");
const Result = require("../response/appResult");
const log_func = require("../logger");

const {FirebaseProjectName} = require("../../config/constants")



const storageRef = admin.storage().bucket(`gs://${FirebaseProjectName}.appspot.com`);

async function uploadFile(path, filename, imageFile) {

    const file= await storageRef.file(`/uploads/hashnode/${filename}`)
    await file.save(imageFile, { contentType: 'image/jpeg'  });
    // return file.publicUrl();
    // Upload the File
    const storage = await storageRef.upload(path, {
        public: true,
        destination: `/uploads/hashnode/${filename}`,
        metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
        },

    });


    return storage[0].metadata.mediaLink;
}

const projName=`${FirebaseProjectName}.appspot.com`
const toBeRemoved = `https://storage.googleapis.com/${projName}/`
const ToBeAdded= `https://firebasestorage.googleapis.com/v0/b/${projName}/o/`


exports.deleteAllFirebaseImages=async ()=>{
    try {
        const res = await storageRef.deleteFiles()
        return Result.Ok(res)
    } catch (e) {
        return Result.Failed(e)
    }
}

//gets the id of an image and deletes it from firebase
exports.deleteFirebaseImageById=async (id) => {
    let url1=""
    // const file = storageRef.file(url)
    try {
        const res = await storageRef.deleteFiles({prefix: id})
        log_func("successfully deleted an image", res, "BgMagenta", 2)
        return Result.Ok(res)
    }catch (e){
        return Result.Failed(e, "failed to delete firebase image", "BgRed")
    }

}

//gets a file name & a buffer file, and uploads the file to firebase -> returns an object{imageCover:{img:"name", suffix:""},imagePath:"" }
const FUploadToFirebaseFunc= async (fName, file) => {
    try {

        const fFile = await storageRef.file(fName)
        await fFile.save(file, {contentType: 'image/jpeg'});
        let publicUrl=fFile.publicUrl()

        //replacing the name of the public url so that it can be previewed by browser
        publicUrl.replace(`${toBeRemoved}`,"")
        log_func("public url is", publicUrl, "BgMagenta", 2)
        return  Result.Ok({
            name:fName,
            suffix:"?alt=media",
            imagePath:ToBeAdded
        })

    } catch (e) {

        return  Result.Failed(e, "uploading to firebase failed")
    }
}


module.exports.FUploadToFirebaseFunc=FUploadToFirebaseFunc;












//upload buffer
// export const uploadImage = async (destination: string, image: Buffer) => {
//     const file = storage.bucket().file(destination);
//     await file.save(image, { contentType: yourContentType });
//     return file.publicUrl();
// };

// (async() => {
//     const url = await uploadFile('./mypic.png', "my-image.png");
//     console.log(url);
// })();