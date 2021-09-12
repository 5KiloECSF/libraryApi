const User = require('../users/userModel');
const { signJwtToken } = require('../../utils/process_JWT');
const { sendResponse, sendResponseWithToken } = require('../../utils/success_response');
const catchAsync = require('../../utils/catchAsyncError');
const AppError = require('../../utils/app_error');


const login = catchAsync(async (req, res, next) => {
    console.log("here-login--")
    const { email, password } = req.body;

    const user = await User.findOne({ email }, '+password').select(['-__v']);


    if (!user) next(new AppError("Wrong credentials", 404));
    if (!(await user.comparePassword(password, user.password))) return next(new AppError("Wrong credentials", 400));

    const login_token = await signJwtToken({
        id: user.id, name: `${user.firstname} ${user.lastname}`
    });
    user.password = undefined
    sendResponseWithToken(200, user, res, login_token);

});

const register = catchAsync(async (req, res, next) => {
    const { firstname, lastname, email, phone, password } = req.body;

    if (await User.findOne({ email })) return next(new AppError("Email already in use", 400));

    const newUser = await User.create({ firstname, lastname, email, phone, password });
    newUser.password = undefined
    newUser.__v = undefined
    sendResponse(200, newUser, res);
});

exports.login =login
exports.register =register
