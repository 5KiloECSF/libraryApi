

const catchAsync = require("../../utils/response/catchAsync");
const User = require("../users/user.model");
const AppError = require("../../utils/response/appError");
const {sendResponseWithToken} = require("../../utils/response/success_response");
// const {getAuth} = require("firebase-admin");
const AppResult = require('../../utils/response/appResult')
const admin = require("../../utils/firebase/firebaseAdmin")




//TODO refactor this to use phone from decoded token
//TODO refactor the firebase method to its own
const PhoneRegister = catchAsync(async (req, res, next)=>{

    const {firstname, lastname,  phone, password, idToken}= req.body;
    console.log("req.body==>",req.body)


    let phone_no
    let firebaseId
    try{
        const decodedToken = await admin.auth().verifyIdToken(idToken)
        firebaseId = decodedToken.uid
        phone_no=decodedToken.phone_number
        console.log("decTOkn=>", decodedToken)
    }catch (e){
        return next(
            new AppError("verification error", 401)
        );
    }


    const user = await User.findOne({phone})
    if (user){
        sendResponseWithToken(200, user, res);
        return
    }

    const newUser = await User.create({ firstname, lastname, phone , firebaseId, password});
    newUser.password = undefined
    newUser.__v = undefined
    sendResponseWithToken(200, newUser, res);
    // sendResponse(200, newUser, res);

})


const PhoneChangePwd = catchAsync(async (req, res, next)=>{

    const { phone, newPassword, idToken }= req.body;
    let firebaseId
    try{
        const decodedToken = await admin.auth().verifyIdToken(idToken)
        firebaseId = decodedToken.uid
    }catch (e){
        return next(
            new AppError("verification error", 401)
        );
    }
    const user = await User.findOne({ phone }).select('+password');

    if (!user){
        const newUser = await User.create({ phone , firebaseId});
        newUser.password = undefined
        newUser.__v = undefined
    }
    user.password = newPassword;
    await user.save();
    user.password=undefined
    sendResponseWithToken(200, user, res);
    // sendResponse(200, newUser, res);

})

const passwordLessWithPhone = catchAsync(async (req, res, next)=>{
    const { phone, idToken}= req.body;
    let firebaseId
    try{
        const decodedToken = await admin.auth().verifyIdToken(idToken)
        firebaseId = decodedToken.uid
    }catch (e){
        return next(
            new AppError("verification error", 401)
        );
    }

    const user = await User.findOne({ phone })
    if (user){
        sendResponseWithToken(200, user, res);
        return
    }

    const newUser = await User.create({ phone , firebaseId});
    newUser.password = undefined
    newUser.__v = undefined
    sendResponseWithToken(200, newUser, res);
    // sendResponse(200, newUser, res);

})

// const verifyToken= async (idToken) => {
//
//
//     try {
//         const decodedToken = await admin.auth().verifyIdToken(idToken)
//
//
//         return decodedToken.uid
//     } catch (e) {
//         throw new Error("verification Failed")
//     }
// }


exports.PhoneForgetPwd= PhoneChangePwd
exports.PhoneRegister=PhoneRegister
exports.passwordLessWithPhone=passwordLessWithPhone