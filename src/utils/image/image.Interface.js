const Result = require("../response/appResult");
const sharp = require("sharp");
const {FUploadToFirebaseFunc, deleteFirebaseImageById} = require("../firebase/firebaseImageUploads");
const log_func = require("../logger");
const {deleteAllFirebaseImages} = require("../../utils/firebase/firebaseImageUploads");
const uuid = require("uuid");

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
        return Result.Ok(data, "resizing success", false)
    }catch (e){
        return Result.Failed(e)
    }

};


//TODO take this function to generic Image Upload folder
// ===========  Calls Resize && Calls UploadFirebase,,,,,,, Also Use full For Updating  ==============
// ----------------------------------------------------------------------
//this func calls the resize func then the upload to firebase func
/**
 * @param {file.buffer} file - buffer of the file-- {req.file.imageCover.buffer}
 * @param {string} fName - Name of the image
 */
const IUploadSingleImage= async (file, fName)=>{
    if (!file) return Result.Failed("no image file")
    log_func("you are in Interface Image UPload", "","BgYellow")
    const res =await resizeSinglePic(file)
    if(res.fail()){
        return Result.Failed(res.error,"resizing failed")
    }
    console.log("resizing finished")
    return await FUploadToFirebaseFunc(fName, res.value)
}

// -- uploading for a single file   ----> works the job of-- IUploadSingleImage  && upload1ImageWithNewName
/**
 * @param {req.file ||req.files.imageCover[0] } file - the buffer of the image
 * @param {string} uid - the buffer of the image
 * @param {string} fName - the buffer of the image
 */
exports.uploadSingleImage= async (file, uid, fName="") =>{
    if (!file) return Result.Failed("no image file")
    if(uid===""){
        uid=uuid.v4()
    }
    if(fName===""){
        let names =file.originalname.split(".")
        const name = names[0].trim();
        let type=names[names.length-1]
        fName = `${uid}-${name}-${Date.now()}.${type}`;
    }
    const res =await resizeSinglePic(file.buffer)
    if(res.fail()){
        return Result.Failed(res.error)
    }
    console.log("resizing finished")
    const img={}
    const result= await FUploadToFirebaseFunc(fName, res.value)
    if (result.fail()) {
        return result
        // return new AppError("uploading error", 502)
    }
    // console.log("filename", req.file.filename)
    img.imageCover = result.value.name
    img.suffix = result.value.suffix
    img.imagePath = result.value.imagePath
    return Result.Ok(img)

}

const IDeleteAllImages=async () => {
    return await deleteAllFirebaseImages()
}
const IDeleteImageById= async (id)=>{
    log_func("interface speaking",id, "BgCyan")
    return await deleteFirebaseImageById(id)
}



module.exports.IUploadSingleImage = IUploadSingleImage;
module.exports.IDeleteAllImages = IDeleteAllImages;
module.exports.IDeleteImageById = IDeleteImageById;

