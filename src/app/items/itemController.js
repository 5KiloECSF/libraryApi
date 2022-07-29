const Item = require('./itemModel');
const catchAsync = require('../../utils/response/catchAsync');
const factory = require('../../controllers/factoryController');
const AppError = require('../../utils/response/appError');
const {sendResponse} = require("../../utils/response/success_response");
const log_func=require("../../utils/logger")

const {IDeleteImageById, IUploadSingleImage, IDeleteAllImages} = require("../../utils/image/image.Interface");

const {uploadNewCoverandImages, uploadManyImagesWithNewNames} = require("../../utils/image/3ImageFunc");
const {handleError} = require("../error/global_error_handler");
const {filterObj}= require("../filterFiles")
const Pick= require("../filterFiles")



exports.getAllItems = factory.getAll(Item, [ "page","limit","language", "authors", "pageNo","booksAmount","type", "genre", "name", "team"]);
// exports.getItem = factory.getOne(Item, { path: 'reviews' });
exports.getItem = factory.getOne(Item);

// exports.createItem = factory.createOne(Item);
// exports.updateItem = factory.updateOne(Item);
// exports.deleteItem = factory.deleteOne(Item)

exports.aliasTopItems = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};



//These are the only fields that are allowed to be updated
const allowedUpdate=["genres", "name", "tags", "description", "authors", "image", "language","pageNo","booksAmount","type" ]

exports.deleteItem=catchAsync(async (req,res,next)=>{
    try{
        const doc = await Item.findByIdAndDelete(req.params.id);

        if (!doc)
            return next(new AppError("No document found with given id!", 404));

        const re= await IDeleteImageById(doc.image.id)
        if(re.fail()){
            log_func("deleting image failed", re.value)
        }
    }catch (e){
        log_func("error", e)
    }

    res.status(204).json({
        status:"NoContent",
    })
    // res.json(re)
    // sendResponse(204, null, re);
})

exports.deleteAllItem=catchAsync(async (req,res,next)=>{

    try{
        const doc = await Item.deleteMany();

        if (!doc)
            return next(new AppError("No document found with given id!", 404));

        const re= await IDeleteAllImages()
        if(re.fail()){
            log_func("deleting image failed", re)
        }
    }catch (e){
        log_func("error", e)
    }
    res.status(204).json({
        status:"NoContent",
    })
})

exports.createItem=catchAsync(async (req,res,next)=>{

    try{
        const body=req.body;
        // log_func("creating BOdy===>", body)
        if(!req.files){
            return next(new AppError("NO images found", 502));
        }
        //FIXME to be removed
        // if(req.file){
        //     log_func('in req.file',"HAVE single file" )
        //     let imag= await upload1ImageWithNewName(req.file, "")
        //     if (imag.fail()){
        //         return next(new AppError("uploading error", 502))
        //     }
        //     body.image=imag.value
        //
        // }

        let imag= await uploadNewCoverandImages(req.files)
        if (imag.fail()){
            return next(new AppError("uploading error", 502))
        }
        body.image=imag.value


        const item=await Item.create({
            ...body,
        })
        sendResponse(201, item, res);

    }catch (e){
        log_func("CreateError=", e.message, "red")
        res.status(500).json({
            status:"error",
        })
    }
})


exports.UpdateItem=catchAsync(async (req, res,next)=>{
    try{
        const item=await Item.findById(req.params.id)

        let removedImages=req.body.removedImages
        log_func("req.body==", req.body, "BgGreen")
        let removeLen=0
        if ( removedImages ){
            log_func("images to be Removed=", removedImages, "yellow")
            if(!Array.isArray(removedImages)){removedImages=[removedImages]}
            removeLen=removedImages.length
        }
        if(req.files){
            let files = req.files

            //---------------  1-if the image cover has changed
            //send a file wiht name files.image cover

            if(files.imageCover){
                let result = await IUploadSingleImage(req.files.imageCover[0].buffer, item.image.imageCover)
                if (result.fail()){
                    log_func("updating image failed")
                    await handleError(new AppError("uploading profile", 400), res)
                    return
                }
                log_func("info","----------------Primary Image Updated")
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

            // 4: if images have been removed
            if(removedImages){
                log_func("deleting images", removedImages, "error")
                //TODO add a function to check the removedImages names exist in the image.images array
                await Promise.all(
                    removedImages.map(async (fileName, i)=>{
                        const re= await IDeleteImageById(fileName)
                        if(re.fail()){
                            log_func("error", re.error)
                            return next(new AppError("deleting image failed", 500))
                        }
                    })
                )
                if(!req.body.image){
                    req.body.image=item.image
                }
                console.log("``````````in here removed images", req.body.image.images, "=>",removedImages)
                req.body.image.images=removeSubArr(req.body.image.images, removedImages)
            }
            // 3: if new images have been added
            if(files.images){
                //if it is just a single file change it to an array
                if ( !Array.isArray(files.images)){
                    files.images=[files.images]
                }
                let val=item.image.images.length + files.images.length
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
        }

        log_func("image operation finished", "", "green")

        const filteredBody = Pick(req.body, allowedUpdate);
        // console.log("--filteredBody==", filteredBody,"req.body", req.body, allowedUpdate)

        const doc = await Item.findByIdAndUpdate(req.params.id, filteredBody, {
            new: true,
            runValidators: true,
        });
        if (!doc)
            return next(new AppError("No document found with given id!", 404));

        sendResponse(202, doc, res);
    }catch (e){
        console.log("error happended-->", e.message)
        return next(new AppError("internal server error", 500));
    }

})

const removeSubArr=(mainArr, arrToBeRemoved)=>{
    return mainArr.filter(name => {
        return !arrToBeRemoved.includes(name)
    })
}

//
const validateSubArr=(mainArr, arrToBeValidated)=>{
    return mainArr.filter(name => {
        return arrToBeValidated.includes(name)
    })
}