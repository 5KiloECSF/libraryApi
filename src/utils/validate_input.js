const {validationResult} = require("express-validator");

const validateInput = (req, resp, next) => {
    console.log("validateing---")
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const extractedErrors = [];
    errors.array().map((er) => extractedErrors.push({ [er.param]: er.msg }));

    return resp.status(422).json({
        errors: extractedErrors,
    });
};

exports.validateInput=validateInput