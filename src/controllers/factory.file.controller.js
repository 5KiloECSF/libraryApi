
const {sendError,sendResponse}= require("../utils/response/success_response");
const catchAsync = require("../utils/response/catchAsync");

const AppError = require("../utils/response/appError");
const {uploadNewCoverandImages, uploadManyImagesWithNewNames, upload1ImageWithNewName} = require("../utils/image/3ImageFunc");

const log_func = require("../utils/logger");

const {IUploadSingleImage, IDeleteImageById} = require("../utils/image/image.Interface");
const {handleError} = require("../app/error/global_error_handler");
const Pick = require("../app/filterFiles");
const {log_err} = require("../utils/logger");

function generateP(len ) {
    let pass = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        'abcdefghijklmnopqrstuvwxyz0123456789@#$';

    for (let i = 1; i <= len; i++) {
        let char = Math.floor(Math.random()
            * str.length + 1);
        pass += str.charAt(char)
    }
    return pass;
}
exports.createOneWithManyImage = (Model, isImageReq=true, generatePwd=false, modelPrefix="") =>
    catchAsync(async (req, res, next) => {
        try{
            const body=req.body;
            if(generatePwd){
                let newPwd=generateP(7)
                log_func("pwd", newPwd)
                body.password=newPwd
                body.tempPwd=newPwd
            }
            // log_func("creating BOdy===>", body)
            if(isImageReq && !req.files){
                return next(new AppError("NO images found", 502));
            }
            if(req.files){
                let imag= await uploadNewCoverandImages(req.files, modelPrefix)
                if (imag.fail()){
                    return next(new AppError("uploading error", 502))
                }
                body.image=imag.value
            }
            const item=await Model.create({
                ...body,
            })
            sendResponse(201, item, res);

        }catch (e){
            log_func("CreateError=", e.message, "red")
            res.status(500).json({
                status:"error",
            })
        }
    });



exports.updateWithManyImages = (Model,  allowedUpdate=[]) =>
    catchAsync(async (req, res, next) => {

        try{
            const item=await Model.findById(req.params.id)
            if(req.files){
                let files = req.files

                //---------------  1-if the image cover has changed
                //send a file wiht name files.image cover
                req.body.image=item.image
                if(files.imageCover){
                    let result = await IUploadSingleImage(req.files.imageCover[0].buffer, item.image.imageCover)
                    if (result.fail()){
                        log_func("updating cover image failed")
                        await handleError(new AppError("uploading profile", 400), res)
                        return
                    }
                    log_func("info","----------------Primary Image Updated")
                }


                let removedImages=req.body.removedImages
                // let removeLen=0
                if ( removedImages ){
                    log_func("requested images to Be deleted=", removedImages, "BgYellow")
                    if(!Array.isArray(removedImages)){removedImages=[removedImages]}
                    // removeLen=removedImages.length
                }
                // 4: if images have been removed
                if(removedImages){
                    log_func("deleting images", removedImages, "magenta")
                    log_func("existing images", item.image.images)
                    await Promise.all(
                        removedImages.map(async (fileName, i)=>{
                            log_func(`image:-- ${i}:== `, fileName)

                            // to check the removedImages names exist in the image.images array
                            if( item.image.images.includes(fileName)){
                                log_func("removing", `${i}:->${fileName}`, "red")
                                const re= await IDeleteImageById(fileName)
                                if(re.fail()){
                                    log_func("error", re.error)
                                    return next(new AppError("deleting image failed", 500))
                                }
                            }

                        })
                    )

                    req.body.image.images= removeSubArr(req.body.image.images, removedImages)
                }
                // 3: if new images have been added
                if(files.images){
                    //if it is just a single file change it to an array
                    if ( !Array.isArray(files.images)){
                        files.images=[files.images]
                    }
                    //to Get the length of the existing images Plus the new added images
                    let val=req.body.image.images.length+ files.images.length
                    if (val >3){
                        // return handleError(new AppError("file length cant exceed 3", 400), res)
                        return next(new AppError(`file length cant exceed 3 - found=${val}`, 404))
                    }
                    const res =await uploadManyImagesWithNewNames(files.images, item.image.id)
                    if (res.fail()){
                        log_func("adding images failed")
                        return next(new AppError(" adding new images error", 404));
                    }
                    if(!req.body.image){
                        req.body.image=item.image
                    }
                    req.body.image.images=[...item.image.images, ...res.value]
                    console.log("the req Item",req.body.image.images)
                }

                /** 2: if other images have changed
                 // if(files.updatedImages && req.body.updatedImagesNames){
                //     console.log("updating multiple", req.body.updatedImagesNames)
                //     // --> to validate the image names already existed
                //     let fileNames=validateSubArr(item.image.images, req.body.updatedImagesNames)
                //     const res= await uploadImagesWIthGivenNames(req.files.updatedImages, fileNames)
                //     if (res.fail()){
                //         log_func("updating image failed")
                //
                //         return handleError(res.error, res)
                //     }
                //
                 **/
            }

            log_func("image operation finished", "", "green")

            const filteredBody = Pick(req.body, allowedUpdate);
            // console.log("--filteredBody==", filteredBody,"req.body", req.body, allowedUpdate)

            const doc = await Model.findByIdAndUpdate(req.params.id, filteredBody, {
                new: true,
                runValidators: true,
            });
            if (!doc)
                return next(new AppError("No document found with given id!", 404));

            sendResponse(202, doc, res);
        }catch (e){
            // log_err("update error", e, "red")
            console.log("error happended-->", e.message, e)
            return next(new AppError("internal server error", 500));
        }



    });

const removeSubArr=(mainArr, arrToBeRemoved)=>{
    return mainArr.filter(name => {
        return !arrToBeRemoved.includes(name)
    })
}

exports.deleteWithImages = (Model) =>
    catchAsync(async (req, res, next) => {
        try{
            const doc = await Model.findByIdAndDelete(req.params.id);

            if (!doc)
                return next(new AppError("No document found with given id!", 404));

            const re= await IDeleteImageById(doc.image.id)
            if(re.fail()){
                log_func("deleting image failed", re.value)
            }
            sendResponse(204, doc, res);
        }catch (e){
            log_func("error", e)
            res.status(500).json({
                status:"error",
            })
        }

    });



exports.updateOneWithImage = (Model, allowedUpdate=[]) =>
    catchAsync(async (req, res, next) => {

        try{
            log_func("req.body", req.body)
            // 1) Filtered out unwanted fields names that are not allowed to be updated
            const filteredFields = Pick(req.body, allowedUpdate);
            log_func("pick", )
            // 2) Update user document
            const doc = await Model.findByIdAndUpdate(req.params.id, filteredFields, {
                new: true,
                runValidators: true,
            });
            log_func("doc==", doc, "BgYellow")
            console.log("doc")
            if (!doc){
                console.log("NODoc")
                return next(new AppError("No document found with given id!", 404));
            }

            //3) if a the image is being Updated change it
            if(req.file){
                let result = await IUploadSingleImage(req.file.buffer, doc.image.imageCover)
                if (result.fail()){
                    return next(new AppError("uploading error", 502))
                }
            }
            sendResponse(202, doc, res);
        }catch (e){
            sendError(500, e.message, res);
        }
    });


exports.createOneWithOneImage = (Model, modelPrefix="") =>
    catchAsync(async (req, res, next) => {
        try{
            const body=req.body;
            // log_func("creating BOdy===>", body)
            if(!req.file){
                return next(new AppError("NO images found", 502))
            }
            log_func('in req.file',"HAVE single file" )
            let imag= await upload1ImageWithNewName(req.file, "", modelPrefix)
            if (imag.fail()){
                return next(new AppError("uploading error", 502))
            }
            body.image=imag.value

            const genre=await Model.create({
                ...body,
            })

            sendResponse(202, genre, res);
        }catch (e){
            sendError(500, e.message, res);
        }


    });
