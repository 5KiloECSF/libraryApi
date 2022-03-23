const Result = require("../response/appResult");
const sharp = require("sharp");
const uuid = require("uuid");
const {uploadToFirebaseFunc} = require("../firebase/firebaseImageUploads");


// this takes a buffer of image and resizes it and returns the compressed buffer
const resizeSinglePic = async (file) => {
    console.log("resizingImage")
    // memUpload.single("imageCover")
    if (!file) return Result.Failure(new Error("no image found"));

    // const pixelArray = new Uint8ClampedArray(file.buffer);

    try {
        const data = await sharp(file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toBuffer();
        return Result.Ok(data)
    }catch (e) {
        return Result.Failure(e)
    }

};



exports.uploadSingleImage= async (file)=>{
    if (!file) return Result.Failure("no image file")

    const name = file.originalname.split(".")[0].trim();
    const type = file.originalname.split(".")[1];
    let uid=uuid.v4()
    let fName = `${uid}-${name}-${Date.now()}.${type}`;

    const res =await resizeSinglePic(file)
    console.log("zRes=", res)
    if(res.fail()){
        return Result.Failure(res.error)
    }
    const uploadRes=await uploadToFirebaseFunc(fName, file)
    if (uploadRes.fail()){
        return Result.Failure(uploadRes.error)
    }
    return uploadRes
}


