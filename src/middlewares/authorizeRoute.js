const AppError = require("../utils/app_error");
const catchAsync = require("../utils/catchAsyncError");
const User = require("../app/users/userModel");
const {verifyJwtToken} = require("../utils/process_JWT");
const { isAdminInWhiteList } = require("./check_admin_white_list");




//given a list of roles
const restrictRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action!", 403)
      );
    }
    next();
  };
};

const protectRoute = catchAsync(async (req, res, next) => {
  let tokenString = '';

  if (req.headers.authorization&& req.headers.authorization.split(' ')[1]) {
    // let tokenArray = req.header('authorization').split(' ');
    // tokenString = tokenArray[0] === 'Bearer' ? tokenArray[1] : tokenArray[0];
    tokenString = req.header('authorization').split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    tokenString = req.cookies.jwt;
  } else {
    return next(new AppError('Unauthorized! please sign in first!', 401));
  }

  if (!tokenString) return next(new AppError('Unauthorized! please sign in first!', 401));

  const decoded_authenticate_token = await verifyJwtToken(tokenString);
  const currentUser = await User.findById(decoded_authenticate_token.id).select(['+password', '-__v', '+active']);

  if (!currentUser)
    return next(
        new AppError('User no longer exist! please sign in again!', 401)
    );

  if (currentUser.checkPasswordChange(decoded_authenticate_token.iat))
    return next(
        new AppError('User recently changed password! please sign in again!', 401)
    );
  //check and assign role
  if (isAdminInWhiteList(currentUser)) {
    currentUser.role = 'admin'
  } else if (currentUser.role === 'admin') {
    return next(
        new AppError('Bad request! This user is not an admin', 401)
    );
  }
  req.user = currentUser;
  next();
});


exports.protectRoute= protectRoute
exports.restrictRole = restrictRole
