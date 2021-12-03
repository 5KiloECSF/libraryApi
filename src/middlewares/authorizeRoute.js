const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../app/users/userModel");
const {verifyJwtToken} = require("../utils/process_JWT");
const { isAdminInWhiteList } = require("./check_admin_white_list");




//given a list of roles
const restrictRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You don't have permission to perform this action!", 403));
    }
    next();
  };
};

const protectRoute = catchAsync(async (req, res, next) => {
  let tokenString = '';
  // 1) Getting token and check of it's there
  if (req.headers.authorization&& req.headers.authorization.split(' ')[1]) {
    // let tokenArray = req.header('authorization').split(' ');
    // tokenString = tokenArray[0] === 'Bearer' ? tokenArray[1] : tokenArray[0];
    tokenString = req.header('authorization').split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    tokenString = req.cookies.jwt;
  } else {
    return next(new AppError('Unauthorized! please sign in first!', 401));
  }

  if (!tokenString) return next(new AppError('Unauthorized! please log in first!', 401));

  // 2) Verification token
  const decoded_token = await verifyJwtToken(tokenString);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded_token.id).select(['+password', '-__v', '+active']);

  if (!currentUser)
    return next(
        new AppError('User no longer exist! please sign in again!', 401)
    );

  // 4) Check if user changed password after the token was issued
  if (currentUser.checkPasswordChange(decoded_token.iat))
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
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});


exports.protectRoute= protectRoute
exports.restrictRole = restrictRole
