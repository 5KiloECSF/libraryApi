
const Item = require('./itemModel');
const catchAsync = require('../../utils/response/catchAsync');
const factory = require('../../controllers/factoryController');
const AppError = require('../../utils/response/appError');
const {sendResponse} = require("../../utils/response/success_response");
const log_func=require("../../utils/logger")

const {deleteFirebaseImage, uploadToFirebaseFunc, uploadSingleImage} = require("../../utils/firebase/firebaseImageUploads");
const {login} = require("../auth/authController");
const uuid = require("uuid");
const sharp = require("sharp");
// const {uploadSingleImage} = require("../../utils/firebase/firebaseImageUploads");


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
        let result = await uploadSingleImage(req.file, doc.imageCover.img)
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

        const re= await deleteFirebaseImage(doc.imageCover.img)
        if(re.fail()){
            log_func("deleting image failed", re)
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

exports.createItem=catchAsync(async (req,res,next)=>{


    const body=req.body;
    console.log("creating BOdy===>", body)
    if(req.file){

        const result=await  uploadSingleImage(req.file)
        // console.log("result", result)
        if (result.fail()){
            return new AppError("uploading error", 502)
        }
        // console.log("filename", req.file.filename)
        body.image.imageCover=result.value.name
        body.image.suffix=result.value.suffix
        body.image.imagePath=result.value.imagePath
    }
    if(req.files){
        // if (!req.files.imageCover || !req.files.images) return next();
        let uid=uuid.v4()
        body.image={}
        body.image.images=[]

        const covr= req.files.imageCover[0]
        const name = covr.originalname.split(".")[0].trim();
        const type = covr.originalname.split(".")[1];

        let fName = `${uid}-${name}-${Date.now()}.${type}`;

        const result=await  uploadSingleImage(req.files.imageCover[0].buffer, fName)
        // console.log("result", result)
        if (result.fail()){
            return new AppError("uploading error", 502)
        }
        console.log("result==>",result)
        // console.log("filename", req.file.filename)
        body.image.imageCover=result.value.name
        body.image.suffix=result.value.suffix
        body.image.imagePath=result.value.imagePath


        //-------------------- multiple image
        await Promise.all(
            req.files.images.map(async (file, i) => {
                console.log("iterating``````````",i,"---->", file)

                let names =file.originalname.split(".")
                let ext=names[names.length-1]
                console.log("ext==", ext)

                const filename = `${uid}-${Date.now()}-${i + 1}.${ext}`;
                console.log("fname````````...>",i, filename)

                const result= await  uploadSingleImage(file.buffer,  filename)
                if (result.fail()){
                    console.log("err=>",result.error)
                    return new AppError("uploading error", 502)
                }

                body.image.images.push(result.value.name)
                console.log("bdy.img===", body.image.images)


            })
        );
        // req.files.images.forEach(async ( e ) =>  {
        //
        //     const result= await  uploadSingleImage(e.buffer, "", uid)
        //     body.images.push(result.value.name)
        // })
        console.log("multi images=--->", body.image)
    }
    // console.log("here with body------------>", body)
    // console.log("here with req------------>", req.files)

    const item=await Item.create({
        ...body,
    })
    res.status(201).json({
        status:"success",
        item
    })
    console.log("200")
})
