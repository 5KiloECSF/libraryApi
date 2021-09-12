const User = require("./userModel");
const AppError = require("../../utils/app_error");
const catchAsync = require("../../utils/catchAsyncError");
const { signJwtToken } = require("../../utils/process_JWT");
const { sendResponse, sendResponseWithToken,} = require("../../utils/success_response");

const constroller = require("../../controllers/generalController");

// filter for fields that are allowed to be updated
const filterBody = (reqBody, ...allowedFields) => {
  let newReqBody = {};
  Object.keys(reqBody).forEach((el) => {
    if (allowedFields.includes(el)) {
      newReqBody[el] = reqBody[el];
    }
  });
  return newReqBody;
};

// changes the params id to the authenticated uses id form the token
const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const updateMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user = req.user;
  if (!currentPassword || !newPassword)
    return next(new AppError("The current and new password is required!", 401));
  if (currentPassword === newPassword)
    return next(
      new AppError("Password is same! please choose different password", 401)
    );
  if (confirmPassword !== newPassword)
    return next(
      new AppError("Password and confirm password must be the same", 401)
    );
  // console.log(currentPassword);
  if (!(await user.comparePassword(currentPassword, req.user.password)))
    return next(new AppError("old password is wrong!", 401));

  user.password = newPassword;
  await user.save();

  const update_pwd_token = await signJwtToken({
    id: user.id,
    name: `${user.firstname} ${user.lastname}`,
  });
  req.user.password = undefined;
  sendResponseWithToken(200, req.user, res, update_pwd_token);
});

const updateMe = catchAsync(async (req, res, next) => {
  const filtedFields = filterBody(
    req.body,
    "firstname",
    "lastname",
    "phone",
    "email"
  );
  await User.findByIdAndUpdate(req.user.id, filtedFields, {
    new: true,
    runValidators: true,
  });

  req.user.password = undefined;
  sendResponse(200, req.user, res);
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
exports.updateMyPassword = updateMyPassword
exports.updateMe = updateMe
exports.deleteMe = deleteMe
exports.follow = follow
exports.unFollow = unFollow

// admin operations

// dont try to update user password through this
exports.createUser = constroller.createOne(User);
exports.updateUser = constroller.updateOne(User);
exports.getAllUsers = constroller.getAll(User);
exports.getUser = constroller.getOne(User);
exports.deleteUser = constroller.deleteOne(User);
