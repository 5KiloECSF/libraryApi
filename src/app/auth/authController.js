const User = require('../users/userModel');
const { sendResponse, sendResponseWithToken } = require('../../utils/success_response');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Email = require("../../utils/email");


const login = catchAsync(async (req, res, next) => {
    console.log("here-login--")
    const { phone, password } = req.body;

    // 1) Check if email and password exist
    if (!phone || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) Check if user exists && password is correct
    const user = await User.findOne({ phone }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
        return next(new AppError('Incorrect phone or password', 401));
    }


    // 3) If everything ok, send token to client
    sendResponseWithToken(200, user, res);

});






const register = catchAsync(async (req, res, next) => {
    const { firstname, lastname, email, phone, password, passwordConfirm } = req.body;

    if (await User.findOne({ email })) return next(new AppError("Email already in use", 400));

    const newUser = await User.create({ firstname, lastname, email, phone, password });
    newUser.password = undefined
    newUser.__v = undefined
    sendResponse(200, newUser, res);
});




const updateMyPassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');


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

    // 2) Check if POSTed current password is correct
    if (!(await user.comparePassword(currentPassword, user.password)))
        return next(new AppError("old password is wrong!", 401));
    // 3) If so, update password

    // 4) Log user in, send JWT
    sendResponseWithToken(200, req.user, res);
});



const sendForgotPasswordTokenByEmail = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    try {
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!'), 500);
    }
});


const resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now()}
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    sendResponseWithToken(200, user, res);
    // createSendToken(user, 200, req, res);
});


exports.forgotPassword= sendForgotPasswordTokenByEmail
exports.resetPassword=resetPassword
exports.login =login
exports.register =register
exports.updateMyPassword = updateMyPassword