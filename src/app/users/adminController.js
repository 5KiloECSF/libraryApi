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
exports.updateUser = updateUsr
exports.getAllUsers = controller.getAll(User);
exports.getUser = controller.getOne(User);
exports.deleteUser = controller.deleteOne(User);
exports.createUser = controller.createOne(User);
