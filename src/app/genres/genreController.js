const Genre = require("./genreModel");
const catchAsync = require("../../utils/response/catchAsync");
const AppError = require("../../utils/response/appError");
const Pick =require('../filterFiles')

const controller = require("../../controllers/factoryController");
const {deleteFirebaseImage, IUploadSingleImage} = require("../../utils/firebase/firebaseImageUploads");
const {upload1ImageWithNewName} = require("../../utils/image/3ImageFunc");

const log_func = require("../../utils/logger");
const { sendResponse, sendError} = require("../../utils/response/success_response");
const {handleError} = require("../error/global_error_handler");



// admin operations
/*
image Operations
- update info with out profile image,
- add a profile image
- remove the profile image
- update the profile image
 */
const updateGenre = catchAsync(async (req, res, next) => {

    try{
      const allowedFields=["name",  "image", "description"]
      log_func("req.body", req.body)
      // 1) Filtered out unwanted fields names that are not allowed to be updated
      const filteredFields = Pick(req.body, allowedFields);
      log_func("pick", )
      // 2) Update user document
      const doc = await Genre.findByIdAndUpdate(req.params.id, filteredFields, {
        new: true,
        runValidators: true,
      });
      log_func("doc==", doc, "BgYellow")
      console.log("doc")
      if (!doc){
        console.log("NODoc")
        return next(new AppError("No document found with given id!", 404));
      }

      //3) if a the image is being Updated change it
      if(req.file){
        let result = await IUploadSingleImage(req.file.buffer, doc.image.imageCover)
        if (result.fail()){
          return next(new AppError("uploading error", 502))
        }
      }


      sendResponse(202, doc, res);
    }catch (e){
      sendError(500, e.message, res);
    }

});

const createGenre = catchAsync(async (req, res, next) => {


  const body=req.body;
  // log_func("creating BOdy===>", body)
  if(!req.file){
    return next(new AppError("NO images found", 502))
  }
  log_func('in req.file',"HAVE single file" )
  let imag= await upload1ImageWithNewName(req.file, "")
  if (imag.fail()){
    return next(new AppError("uploading error", 502))
  }
  body.image=imag.value

  const genre=await Genre.create({
    ...body,
  })

  sendResponse(202, genre, res);
});

const deleteGenre = catchAsync(async (req, res, next) => {
  // 1) Delete user document
  const doc = await Genre.findByIdAndDelete(req.params.id);
  if (!doc)
    return next(new AppError("No document found with given id!", 404));
  log_func("deleted Doc", doc, "BgYellow", 2)
  // 3) Delete Genre Image
  const re= await deleteFirebaseImage(req.body.image)
  if(re.fail()){
    return next(new AppError("deleting image failed", 500))
  }
  sendResponse(204, doc, res);

})


exports.updateGenre = updateGenre
exports.deleteGenre = deleteGenre;
exports.createGenre = createGenre
exports.getAllGenres = controller.getAll(Genre, ["name"]);
exports.getGenre = controller.getOne(Genre);
