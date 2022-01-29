const AppError=require('./appError')
const multer=require('multer')
const path=require('path')
const sharp = require('sharp');
const catchAsync = require("./catchAsync");





const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        // console.log("image filtering----")
        cb(null, true);
    } else {
        // console.log(file.mimetype)
        cb(new AppError('File is not a image type', 400), false);
    }
};

// Creating Multer Storage
//=================== ------------ this Is DiskStorage --------- ================
const multerDiskStorage = (paths="img")=> multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/img", paths)); // args - error and destination
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1]; // Getting mime type (jpg, jpeg, png..)
        console.log("ext",ext)
        cb(null, `${paths}-${Date.now()}.${ext}`); // Creating filename
    }
});


// Setting up Multer
const upload =(paths="")=> multer({
    storage: multerDiskStorage(paths),
    fileFilter: multerFilter
});


exports.uploadSingleImage= (paths)=>upload(paths).single("img")

exports.uploadImages= (paths)=>upload(paths).array("images",5)


// =====================  These Are used TO Resize and Upload Images =============

const multerStorage = multer.memoryStorage();

const memUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadImagesToMemory = memUpload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);


exports.resizeSinglePhoto =(path)=> catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `${path}-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/${path}/${req.file.filename}`);

    next();
});


exports.resizeManyImages =(paths="images")=> catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    // 1) Cover image
    req.body.imageCover = `${paths}-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/${paths}/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `${paths}-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/${paths}/${filename}`);

            req.body.images.push(filename);
        })
    );

    next();
});
