const User = require("./userModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");


const { sendResponse, sendResponseWithToken,} = require("../../utils/success_response");

const controller = require("../../controllers/factoryController");

// filter for fields that are allowed to be updated
const filterBody = (reqBody, ...allowedFields) => {
  let newReqBody = {};
  Object.keys(reqBody).forEach((el) => {
    if (allowedFields.includes(el)) newReqBody[el] = reqBody[el];

  });
  return newReqBody;
};

// changes the params id to the authenticated uses id form the token
const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};  

const updateMe = catchAsync(async (req, res, next) => {
  console.log("here")
  // 1) Create error if user POSTs password data
  // if (req.body.password || req.body.passwordConfirm) {
  //   return next(
  //       new AppError('This route is not for password updates. Please use /updateMyPassword.', 400)
  //   );
  // }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filtedFields = filterBody(
    req.body,
    "firstname",
    "lastname",
    "phone",
    "email"
  );
  // 3) Update user document
  // await User.findByIdAndUpdate(req.user.id, filtedFields, {
  console.log("req.param", req.params.id, filtedFields)



  const datas = await User.findByIdAndUpdate(req.params.id, filtedFields, {
    new: true,
    runValidators: true,
  });

  console.log("in here=>", datas)
  // req.user.password = undefined;
  sendResponse(202, datas, res);
});

const deleteMe = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password)
    return next(new AppError("Password is required for this operation!", 401));
  if (!(await req.user.comparePassword(password.toString(), req.user.password)))
    return next(new AppError("Password is wrong!", 401));
  await User.findByIdAndUpdate(req.user.id, { active: false });

  sendResponse(204, null, res);
});

const follow = catchAsync(async (req, res, next) => {
  const { targetId } = req.body;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
    $addToSet: { following: targetId },
  });
  sendResponse(204, null, res);
});

const unFollow = catchAsync(async (req, res, next) => {
  const { targetId } = req.body;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
    $pull: { following: targetId },
  });

  sendResponse(204, null, res);
});

exports.getMe =getMe

exports.updateMe = updateMe
exports.deleteMe = deleteMe

exports.follow = follow
exports.unFollow = unFollow

// admin operations

const updateUsr = catchAsync(async (req, res, next) => {

  // // 1) Create error if user POSTs password data
  // if (req.body.password || req.body.passwordConfirm) {
  //   console.log("found error")
  //   return next(
  //       new AppError('This route is not for password updates. Please use /updateMyPassword.', 400)
  //
  //       // new Error("error")
  //   );
  // }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filtedFields = filterBody(
      req.body,
      "firstname",
      "lastname",
      "phone",
      "email"
  );

  console.log("filteredFields", filtedFields)
  console.log("reqParams", req.params.id)

  // 3) Update user document
  const doc = await User.findByIdAndUpdate(req.params.id, filtedFields, {
    new: true,
    runValidators: true,
  });
  console.log("here 22", doc)

  // req.user.password = undefined;


  if (!doc){
    console.log("NODoc")
    return next(new AppError("No document found with given id!", 404));
  }


  sendResponse(202, doc, res);

});
// dont try to update user password through this
exports.createUser = controller.createOne(User);
exports.updateUser = updateUsr
exports.getAllUsers = controller.getAll(User);
exports.getUser = controller.getOne(User);
exports.deleteUser = controller.deleteOne(User);
