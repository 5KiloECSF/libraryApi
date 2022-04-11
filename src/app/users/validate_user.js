const { body } = require("express-validator");

const updatePasswordRule = () => {
    return [
        body("newPassword")
            .not()
            .isEmpty()
            .withMessage("password is required")
            .isLength({ min: 6 })
            .withMessage("password should be at least 6 character long"),
    ];
};

const userUpdateRule = () => {
    return [
        body("firstname")
            .optional()
            .isLength({ min: 2 })
            .withMessage("first name should be at least 2 charachter long"),
        body("lastname")
            .optional()
            .isLength({ min: 2 })
            .withMessage("last name should be at least 2 charachter long"),
        body("email")
            .optional()
            .isEmail(),
        body("phone")
            .optional()
            .isLength({ min: 10, max: 14 })
            .withMessage("Invalid phone number input"),
        body("password")
            .optional()
            .isEmpty()
            .isLength({ min: 6 })
            .withMessage("password should be at least 6 character long"),
    ];
};


exports.userUpdateRule=userUpdateRule
exports.updatePasswordRule=updatePasswordRule
