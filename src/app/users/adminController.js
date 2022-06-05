const User = require("./userModel");
const AppError = require("../../utils/response/appError");
const catchAsync = require("../../utils/response/catchAsync");
const {filterObj} =require('../filterFiles')

const { sendResponse} = require("../../utils/response/success_response");

const controller = require("../../controllers/factoryController");
const {IDeleteImageById} = require("../../utils/image/image.Interface");
const log_func = require("../../utils/logger");

const {upload1ImageWithNewName} = require("../../utils/image/3ImageFunc");
const {queryUsers} = require("./user.services")
const pick = require("../filterFiles");
// admin operations
/*
image Operations
- update info with out profile image,
- add a profile image
- remove the profile image
- update the profile image
 */
const updateUsr = catchAsync(async (req, res, next) => {

  // 1) Create error if user POSTs password data

  if (req.body.password || req.body.passwordConfirm){
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400)
    );
  }

  const allowedFields=["firstname", "lastname", "phone", "email", "image"]
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredFields = filterObj(req.body, allowedFields);

  // 3) Remove Images if Removed
  let removedImg=req.body.removedImage
  if (removedImg){
    const re= await IDeleteImageById(removedImg)
    if(re.fail()){
      return next(new AppError("deleting image failed", 500))
    }
    filteredFields.image=""
  }
  //4) if a new image is being added or Updated upload it
  if(req.file){

    let imag= await upload1ImageWithNewName(req.file, req.params.id)
    if (imag.fail()){
      return next(new AppError("uploading error", 502))
    }
    filteredFields.image=imag.value
  }

  // 5) Update user document
  const doc = await User.findByIdAndUpdate(req.params.id, filteredFields, {
    new: true,
    runValidators: true,
  });
  // req.user.password = undefined;
  if (!doc){
    log_func("Updating Doc NOt Found", doc, "BgRed")
    return next(new AppError("No document found with given id!", 404));
  }
  sendResponse(202, doc, res);
});

const deleteUser = catchAsync(async (req, res, next) => {
  // 1) Delete user document
  const doc = await User.findByIdAndDelete(req.params.id);
  if (!doc)
    return next(new AppError("No document found with given id!", 404));

  // 3) Delete user document
  const re= await IDeleteImageById(req.params.id)
  if(re.fail()){
    return next(new AppError("deleting image failed", 500))
  }
  sendResponse(204, doc, res);

})

const getUsers = catchAsync(async (req, res, next) => {
  log_func("query=", req.query, "BgGreen")
  // 1) GetAll user document
  const filter = pick(req.query, ['firstName',"lastName", 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const docs = await queryUsers(filter, options)

  if (!docs){
    log_func("docs==", docs, "BgMagenta")
    return next(new AppError("No documents found", 404));
  }

  sendResponse(200, docs, res);

})

// dont try to update user password through this
exports.updateUser = updateUsr
exports.deleteUser = deleteUser;
exports.searchUser =getUsers;
exports.getAllUsers = controller.getAll(User, ["firstName", "lastName", "role", "team"]);
exports.getUser = controller.getOne(User);
exports.createUser = controller.createOne(User);
