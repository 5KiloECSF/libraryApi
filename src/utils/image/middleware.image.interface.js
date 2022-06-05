


// ==================    Middleware ===============================
// this gets file from request and uploads it to firebase

const catchAsync = require("../response/catchAsync");
const {upload1ImageWithNewName} = require("../../utils/image/3ImageFunc");
const AppError = require("../../utils/response/appError");
exports.uploadTOFirebase =(path)=> catchAsync(async (req, res, next) => {
    // console.log("resizingImage")
    const file = req.file;
    if (!file) return next();

    try{
        let imag= await upload1ImageWithNewName(req.file, "")
        if (imag.fail()){
            return next(new AppError("uploading error", 502))
        }
        req.image=imag.value
    }catch (e){
        console.log("have found error")
        console.log(e)
    }
    next();
});