
const Item = require('./itemModel');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../../controllers/factoryController');
const AppError = require('../../utils/appError');


exports.getAllItems = factory.getAll(Item);
// exports.getItem = factory.getOne(Item, { path: 'reviews' });
exports.getItem = factory.getOne(Item );
// exports.createItem = factory.createOne(Item);
exports.updateItem = factory.updateOne(Item);
exports.deleteItem = factory.deleteOne(Item);

exports.aliasTopItems = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.createBook=catchAsync(async (req, res,next)=>{
    const item= req.body
})


exports.createItem=catchAsync(async (req,res,next)=>{


    const body=req.body;
    if(req.file){
        console.log("filename", req.file.filename)
        body.imageCover=req.file.filename
    }
    if(req.files){
        body.images=[]
        req.files.forEach(e=>body.images.push(e.filename))
    }
    // console.log("here with body------------>", body)
    // console.log("here with req------------>", req.files)

    const movie=await Item.create({
        ...body,
    })
    res.status(201).json({
        status:"success",
        movie
    })
    console.log("200")
})
