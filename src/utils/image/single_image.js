const Result = require("../response/appResult");
const sharp = require("sharp");
const uuid = require("uuid");
const {FUploadToFirebaseFunc} = require("../firebase/firebaseImageUploads");



// this takes a buffer of image and resizes it and returns the compressed buffer
const resizeSinglePic = async (file) => {
    console.log("resizingImage")
    // memUpload.single("imageCover")
    if (!file) return Result.Failed(new Error("no image found"));

    // const pixelArray = new Uint8ClampedArray(file.buffer);

    try {
        const data = await sharp(file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toBuffer();
        return Result.Ok(data)
    }catch (e) {
        return Result.Failed(e)
    }

};


// -- uploading for a single file   ----> works the job of-- IUploadSingleImage  && uploadNewImage
/**
 // * @param {file.buffer} file - the buffer of the image
 */
exports.uploadSingleImag= async (file, uid, fName)=>{
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


