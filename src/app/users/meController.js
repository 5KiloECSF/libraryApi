const catchAsync = require("../../utils/response/catchAsync");
const User = require("./userModel");
const AppError = require("../../utils/response/appError");
const {sendResponse} = require("../../utils/response/success_response");








// changes the params id to the authenticated uses id form the token
const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

const updateMe = catchAsync(async (req, res, next) => {
    console.log("here")
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
          new AppError('This route is not for password updates. Please use /updateMyPassword.', 400)
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filtedFields = filterBody(
        req.body,
        "firstname",
        "lastname",
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

// const follow = catchAsync(async (req, res, next) => {
//     const { targetId } = req.body;
//     const updatedUser = await User.findByIdAndUpdate(req.user.id, {
//         $addToSet: { following: targetId },
//     });
//     sendResponse(204, null, res);
// });
// const unFollow = catchAsync(async (req, res, next) => {
//     const { targetId } = req.body;
//     const updatedUser = await User.findByIdAndUpdate(req.user.id, {
//         $pull: { following: targetId },
//     });
//
//     sendResponse(204, null, res);
// });

exports.getMe =getMe
exports.updateMe = updateMe
exports.deleteMe = deleteMe

// exports.follow = follow
// exports.unFollow = unFollow
