const catchAsync = require("../../utils/response/catchAsync");
const User = require("./user.model");
const AppError = require("../../utils/response/appError");
const {sendResponse} = require("../../utils/response/success_response");
const {updateUsr} = require("./user.controller");




// changes the params id to the authenticated uses id form the token
const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};


const deleteMe = catchAsync(async (req, res, next) => {
    const { password } = req.body;
    if (!password)
        return next(new AppError("Password is required for this operation!", 401));
    const user = await User.findOne({ phone:req.user.phone }).select('+password');
    if (!(await user.comparePassword(password, user.password)))
        return next(new AppError("Password is wrong!", 401));
    await User.findByIdAndUpdate(req.user.id, { active: false });

    sendResponse(204, null, res);
});

const favorite = catchAsync(async (req, res, next) => {
    const { targetId } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { favorites: targetId },
    });
    sendResponse(204, null, res);
});
const unFavorite = catchAsync(async (req, res, next) => {
    const { targetId } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        $pull: { favorites: targetId },
    });
    sendResponse(204, null, res);
});

exports.getMe =getMe
exports.updateMe = updateUsr
exports.deleteMe = deleteMe
exports.favorite = favorite
exports.unFavorite = unFavorite
