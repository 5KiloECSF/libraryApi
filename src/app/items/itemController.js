
const Item = require('./itemModel');
const catchAsync = require('../../utils/response/catchAsync');
const factory = require('../../controllers/factoryController');
const AppError = require('../../utils/response/appError');
const {sendResponse} = require("../../utils/response/success_response");
const log_func=require("../../utils/logger")

const {deleteFirebaseImage, uploadToFirebaseFunc, IUploadSingleImage, deleteAllImages} = require("../../utils/firebase/firebaseImageUploads");

const {upload1ImageWithNewName, uploadNewImages, uploadImagesWIthGivenNames, uploadImagesWithNewNames} = require("../../utils/image/3ImageFunc");
const {promise} = require("bcrypt/promises");



exports.getAllItems = factory.getAll(Item);
// exports.getItem = factory.getOne(Item, { path: 'reviews' });
exports.getItem = factory.getOne(Item );
// exports.createItem = factory.createOne(Item);
exports.updateItem = factory.updateOne(Item);
// exports.deleteItem = factory.deleteOne(Item)

exports.aliasTopItems = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
};
const allowedUpdate=["genres", "name", "tags", "description", "authors", "borrowingHistory"]

exports.UpdateBook=catchAsync(async (req, res,next)=>{
    const filteredBody = filterObj(req.body, allowedUpdate);
    const doc = await Item.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
        runValidators: true,
    });
    if (req.file){
        let result = await IUploadSingleImage(req.file, doc.imageCover.img)
        if (result.fail()){
            log_func("updating image failed")
        }
    }
    if (!doc)
        return next(new AppError("No document found with given id!", 404));

    sendResponse(202, doc, res);
})

exports.deleteItem=catchAsync(async (req,res,next)=>{

    try{
        const doc = await Item.findByIdAndDelete(req.params.id);

        if (!doc)
            return next(new AppError("No document found with given id!", 404));

        const re= await deleteFirebaseImage(doc.image.id)
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

        const re= await deleteAllImages()
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
            return new AppError("NO images found", 502)
        }
        //FIXME to be removed
        if(req.file){
            log_func('info',"HAVE single file" )
            let imag= await upload1ImageWithNewName(req.file, "")
            if (imag.fail()){
                return new AppError("uploading error", 502)
            }
            body.image=imag.value

        }

        let imag= await uploadNewImages(req.files)
        if (imag.fail()){
            return new AppError("uploading error", 502)
        }
        body.image=imag.value


        const item=await Item.create({
            ...body,
        })
        res.status(201).json({
            status:"success",
            item
        })
        // console.log("200")
    }catch (e){
        log_func("CreateError=", e.message)
        res.status(500).json({
            status:"error",

        })
    }


})


exports.UpdateItem=catchAsync(async (req, res,next)=>{
    try{
        if(req.files){
            let files = req.files
            //---------------  1-if the image cover has changed
            if(req.body.coverImage && files.imageCover){
                let result = await IUploadSingleImage(req.files.imageCover[0].buffer, req.body.image.imageCover)
                if (result.fail()){
                    log_func("updating image failed")
                }
            }
            // 2: if other images have changed
            if(files.updatedImages){
                const res= uploadImagesWIthGivenNames(req.files.updatedImages, req.body.updatedImages)
                if (res.fail()){
                    log_func("updating image failed")
                }
            }
            // 3: if new images have been added
            if(req.body.addedImages){
                const res =uploadImagesWithNewNames(req.files.addedImages, req.body.image.id)
                if (res.fail()){
                    log_func("adding images failed")
                }
                req.body.image.images=[...req.body.image.images, ...res.value]
            }
        //    4: if images have been removed
            let removedImages=req.body.removedImages
            if(removedImages){
                await Promise.all(
                    removedImages.map(async (fileName, i)=>{
                        const re= await deleteFirebaseImage(fileName)
                        if(re.fail()){
                            log_func("deleting image failed", re)
                        }

                    })
                )
                req.body.image.images=req.body.image.images.filter((name) => {
                    // return those elements not in the namesToDeleteSet
                    return !removedImages.has(name);
                })

            }





        }

        const filteredBody = filterObj(req.body, allowedUpdate);
        const doc = await Item.findByIdAndUpdate(req.params.id, filteredBody, {
            new: true,
            runValidators: true,
        });

        if (!doc)
            return next(new AppError("No document found with given id!", 404));

        sendResponse(202, doc, res);
    }catch (e){

    }

})
