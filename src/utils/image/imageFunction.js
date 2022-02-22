const multer = require("multer");
const catchAsync = require("../catchAsync");
const uuid = require("uuid");
const sharp = require("sharp");
const AppError = require("../appError");
const {Result} = require("../appResult");

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        // console.log("image filtering----")
        cb(null, true);
    } else {
        // console.log(file.mimetype)
        cb(new AppError('File is not a image type', 400), false);
    }
};

const multStorage = multer.memoryStorage();

const memUpload = multer({
    storage: multStorage,
    fileFilter: multerFilter
});

exports.uploadSingleToMemory=memUpload.single("imageCover");
exports.uploadImagesToMemory = memUpload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images[]', maxCount: 3 }
]);

const resizeSinglePhoto = async (path, req) => {
    console.log("resizingImage")
    memUpload.single("imageCover")
    if (!req.file) return Result.Failure(new Error("no image found"));

    let uid = uuid.v4()
    req.file.filename = `${path}-${uid}-${Date.now()}.jpeg`;

    try {
        await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/${path}/${req.file.filename}`);
    }catch (e) {
        return Result.Failure(e)
    }
   return Result.Ok()
};
