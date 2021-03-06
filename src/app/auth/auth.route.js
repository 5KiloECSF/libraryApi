const express = require('express');
const { login, register, updateMyPassword } = require('./authController');
const {PhoneForgetPwd, passwordLessWithPhone, PhoneRegister} = require("./firebaseAuth")
// const { userSigninInputRule, userSignupInputRule,  } = require('./validationAuth');
// const {validateInput } = require('../../utils/validate_input');

const authRouter = express.Router();

authRouter.post('/login',   login);
authRouter.post('/phoneRegister',   PhoneRegister);
authRouter.post('/phonePwdLess',   passwordLessWithPhone);
authRouter.post('/phoneReset',   PhoneForgetPwd);
// authRouter.post('/login', userSigninInputRule(),  login);

authRouter.post('/register',   register)
// authRouter.post('/register', userSignupInputRule(), validateInput, register)
// userRouter.patch("/me/changePassword", updatePasswordRule(),validateInput, usersController.updateMyPassword);
authRouter.patch("/me/changePassword", updateMyPassword);



module.exports = authRouter;