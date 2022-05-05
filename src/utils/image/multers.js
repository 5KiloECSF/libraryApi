const multer = require("multer");

const AppError = require("../response/appError");



const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        // console.log("image filtering----")
        cb(null, true);
    } else {
        // console.log(file.mimetype)
        cb(new AppError('File is not a image type', 400), false);
    }
};

//multer memory image
const multStorage = multer.memoryStorage();

const memUpload = multer({
    storage: multStorage,
    // fileFilter: multerFilter
});

exports.uploadSingleToMemory=memUpload.single("imageCover");

exports.uploadImagesToMemory = memUpload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);
exports.uploadUpdatedImages = memUpload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'addedImages', maxCount: 3 },
]);

