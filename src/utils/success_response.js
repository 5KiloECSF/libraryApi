const {JWT_COOKIE_EXPIRES_IN} = require("./constants");
const {isProduction} = require("./constants");

const sendResponse = (statusCode, data, res) => {
    res.status(statusCode).send({
        status: "success",
        message: {
            results: data instanceof Array ? data.length : undefined,
            data
        }
    });
}

const sendResponseWithToken = (statusCode, data, res, token) => {

    const cookieOption = {
        expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 60 * 60 * 24 * 1000),
        httpOnly: true
    }

    if (isProduction()) cookieOption.secure = true;
    res.cookie('jwt', cookieOption);

    res.status(statusCode).json({
        status: "success",
        token,
        message: {
            results: data instanceof Array ? data.length : undefined,
            data
        }
    });
}

exports.sendResponseWithToken = sendResponseWithToken
exports.sendResponse = sendResponse