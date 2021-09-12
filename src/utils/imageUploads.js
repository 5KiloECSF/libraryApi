const AppError=require('./app_error')
const multer=require('multer')
const path=require('path')


// Creating Multer Storage
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/img")); // args - error and destination
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1]; // Getting mime type (jpg, jpeg, png..)
        console.log("ext",ext)
        cb(null, `movie-${Date.now()}.${ext}`); // Creating filename
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        console.log("image filtering----")
        cb(null, true);
    } else {
        console.log(file.mimetype)
        cb(new AppError('File is not a image type', 400), false);
    }
};

// Setting up Multer
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadImage=upload.single("img")

exports.uploadImages=upload.array("images",5)
