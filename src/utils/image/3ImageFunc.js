const Result = require("../response/appResult");
const uuid = require("uuid");

const {IUploadSingleImage} = require("../../utils/image/image.Interface");
// const {IUploadSingleImage} = require("../../utils/firebase/firebaseImageUploads");
const log_func = require("../../utils/logger");


// ------------------------------  Gives new name To Image & uploads them to firebase  ------------------
//---------: this accepts the general file from the request, which have imageCOver && images
/**
 * @param {req.file||req.files.imageCover[0]} file - a file object from request-{req.file.images{buffer, originalname}}
 * @param {string} uid - Unique ID to save the images with, optional
 */
const upload1ImageWithNewName= async (file, uid="")=>{
    if(uid===""){
        uid=uuid.v4()
    }
    if (!file ) {
        log_func("error", "no req files img")
        return Result.Failed("no image cover")
    }
    const img={}

  //``````````````-- after just the file have been found `````````````````````
    let names =file.originalname.split(".")
    const name =  names[0].trim();
    let type=names[names.length-1]
    let fName = `${uid}-${name}-${Date.now()}.${type}`;

    // log_func('info', "HAVE file")
    const result = await IUploadSingleImage(file.buffer, fName)
    // console.log("result", result)
    if (result.fail()) {
        return result
        // return new AppError("uploading error", 502)
    }
    // console.log("filename", req.file.filename)
    img.imageCover = result.value.name
    img.suffix = result.value.suffix
    img.imagePath = result.value.imagePath
    img.id=uid

    return Result.Ok(img, "Successfully uploaded 1 New Image", true)
}

/**
 * @param {[file]} files - a file object from request-{req.files.images}
 * @param {string} uid - Uid to save the images with
 */
const uploadManyImagesWithNewNames=async (files, uid)=>{
    const names=[]
    try{
        await Promise.all(
            files.map(async (file, i) => {
                // console.log("iterating ``````````", i,"---->", file)

                let name =file.originalname.split(".")
                let ext=name[name.length-1]


                const filename = `${uid}-${Date.now()}-${i + 1}.${ext}`;
                // console.log("******************fname````````...>",i, filename)

                const result= await  IUploadSingleImage(file.buffer,  filename)
                if (result.fail()){
                    return Result.Failed(result.error,"failed uploading multi images, in a loop")
                }

                names.push(result.value.name)
                console.log("bdy.img===", names)
            })
        );
        log_func( "Successfully uploaded Images With new name", names, "BgCyan")
        return Result.Ok(names)
    }catch (e){
        return Result.Failed(e, "uploading many images failed")
    }



}



// =========================  for uploading singleCover Image + multiple New images  -
/**
 * @param {req.files} files - a file object from request-{req.files.images}
 */
const uploadNewCoverAndImages=async (files) => {
    let img={}
    let uid=uuid.v4()

    if(!files){
        return Result.Failed("no image or images found")
    }
    const res= await upload1ImageWithNewName(files.imageCover[0], uid)
    if (res.fail()){
        return res
    }
    img=res.value
    img.id=uid
    //-------------------- multiple image
    if (files.images){
        const result=await uploadManyImagesWithNewNames(files.images, uid)
        if (res.fail()){
            return res
        }
        img.images=result.value
    }
    return Result.Ok(img)

}

// For Updating many Images with a name
const updateImagesWIthGivenNames= async (files, fileNames)=>{
    try{
        if ( !Array.isArray(fileNames)){
            fileNames=[fileNames]
        }
        if (files.length>0 && fileNames.length===files.length  ){
            let images=[]

            await Promise.all(
                files.map(async (file, i) => {
                    const result= await  IUploadSingleImage(file.buffer,  fileNames[i])
                    if (result.fail()){
                        console.log("err=>",result.error)
                        return result
                    }
                    images.push(result.value.name)
                })
            );
            return Result.Ok(images)

        }
    }catch (e){
        return Result.Failed("uploading many Images with given names failed")
    }

}
//

exports.uploadNewCoverandImages=uploadNewCoverAndImages

exports.upload1ImageWithNewName=upload1ImageWithNewName
exports.uploadManyImagesWithNewNames=uploadManyImagesWithNewNames
exports.updateImagesWIthGivenNames=updateImagesWIthGivenNames