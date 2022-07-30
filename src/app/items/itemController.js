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
const controllerWithImage = require("../../controllers/factory.file.controller")



exports.getAllItems = factory.getAll(Item, [ "page","limit","language", "authors", "pageNo","booksAmount","type", "genre", "name", "team"]);
// exports.getItem = factory.getOne(Item, { path: 'reviews' });
exports.getItem = factory.getOne(Item);





exports.deleteItem=controllerWithImage.deleteWithImages(Item)

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

exports.createItem=controllerWithImage.createOneWithManyImage(Item, true, false, "book/");

//These are the only fields that are allowed to be updated
const allowedUpdate=["genres", "name", "tags", "description", "authors", "image", "language","pageNo","booksAmount","type" ]
exports.UpdateItem=controllerWithImage.updateWithManyImages(Item, allowedUpdate)


//Depricated


exports.aliasTopItems = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,page,ratingsAverage,';
    next();
};

const validateSubArr=(mainArr, arrToBeValidated)=>{
    return mainArr.filter(name => {
        return arrToBeValidated.includes(name)
    })
}