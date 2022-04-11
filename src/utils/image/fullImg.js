const Result = require("../response/appResult");
const sharp = require("sharp");
const uuid = require("uuid");
const {uploadToFirebaseFunc} = require("../firebase/firebaseImageUploads");
const {uploadSingleImage} = require("../../utils/firebase/firebaseImageUploads");
const log_func = require("../../utils/logger");


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



exports.uploadSingleImag= async (file)=>{
    if (!file) return Result.Failed("no image file")

    const name = file.originalname.split(".")[0].trim();
    const type = file.originalname.split(".")[1];
    let uid=uuid.v4()
    let fName = `${uid}-${name}-${Date.now()}.${type}`;

    const res =await resizeSinglePic(file)
    console.log("zRes=", res)
    if(res.fail()){
        return Result.Failed(res.error)
    }
    const uploadRes=await uploadToFirebaseFunc(fName, file)
    if (uploadRes.fail()){
        return Result.Failed(uploadRes.error)
    }
    return uploadRes
}

const uploadNewImage= async (file, uid)=>{
    if(!uid){
        uid=uuid.v4()
    }
    if (!file.imageCover ) {
        log_func("error", "no req files img")
        return Result.Failed("no image cover")
    }
    const img={}
    const image= file.imageCover[0]
    const name = image.originalname.split(".")[0].trim();
    const type = image.originalname.split(".")[1];

    let fName = `${uid}-${name}-${Date.now()}.${type}`;

    // log_func('info', "HAVE file")
    const result = await uploadSingleImage(image.buffer, fName)
    // console.log("result", result)
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



const uploadNewImages=async (files) => {
    let img={}
    let uid=uuid.v4()

    if(!files){
        return Result.Failed("no image or images found")
    }
    const res= await uploadNewImage(files, uid)
    if (res.fail()){
        return res
    }
    img=res.value
    img.id=uid
    //-------------------- multiple image
    if (files.images){
        img.images=[]
        await Promise.all(
            files.images.map(async (file, i) => {
                // console.log("iterating ``````````", i,"---->", file)

                let names =file.originalname.split(".")
                let ext=names[names.length-1]
                // console.log("ext==", ext)

                const filename = `${uid}-${Date.now()}-${i + 1}.${ext}`;
                // console.log("******************fname````````...>",i, filename)

                const result= await  uploadSingleImage(file.buffer,  filename)
                if (result.fail()){
                    console.log("err=>",result.error)
                    return Result.Failed("failed uploading multi images, in a loop")
                }
                img.images.push(result.value.name)
                console.log("bdy.img===", img.images)
            })
        );
    }
    return Result.Ok(img)



}
// For Updating many Images with a name
const uploadImagesWIthGivenNames= async (files, fileNames)=>{
    if (files.length>0 && fileNames.length===files.length  ){
        let img={}
        img.images=[]
        await Promise.all(
            files.map(async (file, i) => {
                const result= await  uploadSingleImage(file.buffer,  fileNames[i])
                if (result.fail()){
                    console.log("err=>",result.error)
                    return result
                }
                img.images.push(result.value.name)
            })
        );
    }
}

exports.uploadNewImage=uploadNewImage
exports.uploadNewImages=uploadNewImages
exports.uploadImagesWIthGivenNames=uploadImagesWIthGivenNames