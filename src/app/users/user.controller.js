const User = require("./user.model");
const AppError = require("../../utils/response/appError");
const catchAsync = require("../../utils/response/catchAsync");

const { sendResponse} = require("../../utils/response/success_response");
const controller = require("../../controllers/factoryController");
const controllerWithImage = require("../../controllers/factory.file.controller")

const log_func = require("../../utils/logger");

const {queryUsers} = require("./user.services")
const pick = require("../filterFiles");
const {IDeleteImageById} = require("../../utils/image/image.Interface");




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

const deleteUser = catchAsync(async (req, res, next) => {
  try{
    const user= await  User.findById(req.params.id)

    if (user.donatedCount>1){
      const usr=await User.findByIdAndUpdate(req.params.id, { active: false });
      sendResponse(201, user, res)

    }else{
      const doc = await User.findByIdAndDelete(req.params.id);
      if (!doc)
        return next(new AppError("No document found with given id!", 404));
      const re= await IDeleteImageById(doc.image.id)
      if(re.fail()){
        log_func("deleting image failed", re.value)
      }
      sendResponse(204, doc, res);
    }

  }catch (e){
    log_func("error", e)
    res.status(500).json({
      status:"error",
    })
  }

})


// dont try to update user password through this
exports.updateUser = controllerWithImage.updateWithManyImages(User, ["firstName", "lastName", "phone", "email", "image"])
exports.deleteUser = deleteUser;
exports.createUser = controllerWithImage.createOneWithManyImage(User, false, true,"users/");
exports.searchUser =getUsers;
exports.getAllUsers = controller.getAll(User, ["firstName", "lastName", "role", "team"]);
exports.getUser = controller.getOne(User);
