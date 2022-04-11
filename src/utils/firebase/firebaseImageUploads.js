const admin = require("./firebaseAdmin")
const {v4: uuidv4} = require("uuid");
const catchAsync = require("../response/catchAsync");
const uuid = require("uuid");
const sharp = require("sharp");
const Result = require("../response/appResult");
const log_func = require("../logger");




const storageRef = admin.storage().bucket(`gs://webproj1-a.appspot.com`);

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

const toBeRemoved = "https://storage.googleapis.com/webproj1-a.appspot.com/"
const ToBeAdded= "https://firebasestorage.googleapis.com/v0/b/webproj1-a.appspot.com/o/"
const pre3= "gs://webproj1-a.appspot.com"

exports.deleteAllImages=async ()=>{
    try {
        const res = await storageRef.deleteFiles()
        return Result.Ok(res)
    } catch (e) {
        return Result.Failed(e)
    }
}

//gets the id of an image and deletes it from firebase
exports.deleteFirebaseImage=async (id) => {
    let url1=""
    // const file = storageRef.file(url)
    try {

        const res = await storageRef.deleteFiles({prefix: id})

        return Result.Ok(res)


    } catch (e) {
        return Result.Failed(e)
    }

}



const resizeSinglePic = async (file) => {
    console.log("resizingImage")
    // memUpload.single("imageCover")
    if (!file) return Result.Failed(new Error("no image found"));

    // const pixelArray = new Uint8ClampedArray(file.buffer);

    try {
        const data = await sharp(file)
            .toFormat('jpeg')
            // .toFormat("jpeg", { mozjpeg: true })
            // .jpeg({quality: 50})
            .jpeg({ mozjpeg: true })
            .resize(500, 500)
            .toBuffer()
        return Result.Ok(data, false)
    }catch (e){
        return Result.Failed(e)
    }

};

//gets a file name & a buffer file, and uploads the file to firebase -> returns an object{imageCover:{img:"name", suffix:""},imagePath:"" }
const uploadToFirebaseFunc= async (fName, file) => {
    try {
        log_func("file name on func", fName)
        const fFile = await storageRef.file(fName)
        await fFile.save(file, {contentType: 'image/jpeg'});
        let publicUrl=fFile.publicUrl()

        //replacing the name of the public url so that it can be previewed by browser
        publicUrl.replace(`${toBeRemoved}`,"")
        console.log("public url is",publicUrl)
        return  Result.Ok({
            name:fName,
            suffix:"?alt=media",
            imagePath:ToBeAdded
        })

    } catch (e) {
        log_func("firebase_err=-", e)
        return  Result.Failed(e)
    }
}

//this func calls the resize func then the upload to firebase func
//
const uploadSingleImage= async (file, fName)=>{
    if (!file) return Result.Failed("no image file")
    const res =await resizeSinglePic(file)
    // console.log("zRes=", res)
    if(res.fail()){
        return Result.Failed(res.error)
    }
    console.log("resizing finished")

    return await uploadToFirebaseFunc(fName, res.value)
}




module.exports.uploadSingleImage = uploadSingleImage;



// this gets file from request and uploads it to firebase
exports.uploadTOFirebase =(path)=> catchAsync(async (req, res, next) => {
    // console.log("resizingImage")
    const file = req.file;
    if (!file) return next();

    const name = file.originalname.split(".")[0].trim();
    const type = file.originalname.split(".")[1];
    let uid=uuid.v4()
    // let fName = `default1.${type}`;
    let fName = `${name}-${uid}-${Date.now()}.${type}`;



    console.log("filename=", req.file.filename)
    try{
        const fFile= await storageRef.file(fName)
        await fFile.save(file.buffer, { contentType: 'image/jpeg'  });
        req.file.filename= fFile.publicUrl()
    }catch (e){
        console.log("have found error")
        console.log(e)
    }
    next();
});










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