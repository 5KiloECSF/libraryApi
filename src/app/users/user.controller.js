const User = require("./user.model");
const AppError = require("../../utils/response/appError");
const catchAsync = require("../../utils/response/catchAsync");


const { sendResponse} = require("../../utils/response/success_response");

const controller = require("../../controllers/factoryController");
const controllerWithImage = require("../../controllers/factory.file.controller")

const log_func = require("../../utils/logger");

const {queryUsers} = require("./user.services")
const pick = require("../filterFiles");




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
exports.updateUser = controllerWithImage.updateWithManyImages(User, ["firstname", "lastname", "phone", "email", "image"])
exports.deleteUser = controllerWithImage.deleteWithImages(User);
exports.searchUser =getUsers;
exports.getAllUsers = controller.getAll(User, ["firstName", "lastName", "role", "team"]);
exports.getUser = controller.getOne(User);
exports.createUser = controllerWithImage.createOneWithManyImage(User, false, true);
