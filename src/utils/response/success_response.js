const {signJwtToken} = require("../process_JWT");
const {JWT_COOKIE_EXPIRES_IN} = require("../../config/constants");
const {isProduction} = require("../../config/constants");

const sendResponse = (statusCode, value, res) => {

    res.status(statusCode).send({
        status: "success",
        value,
        results: value instanceof Array ? value.length : undefined,

    });
}

const sendErrorResponse=(statusCode, value, res)=>{
    res.status(statusCode).send({
        status:"error"
    })
}

const sendError = (statusCode, data, res) => {

    res.status(statusCode).send({
        status: "error",
        message: {
            results: data instanceof Array ? data.length : undefined,
            data
        }
    });
}


const sendResponseWithToken = (statusCode, user, res) => {

    const _token = signJwtToken({
        id: user.id,
        name: `${user.firstname} ${user.lastname}`,
        phone: user.phone
    });


    const cookieOption = {
        expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 60 * 60 * 24 * 1000),
        httpOnly: true, // cookie cannot be accessed or modified in any way by the browser
    }

    user.password = undefined;


    if (isProduction()) cookieOption.secure = true;
    res.cookie('jwt', cookieOption);

    console.log("response===-->", statusCode)
    res.status(statusCode).json({
        status: "success",
        _token,
        message: {
            results: user instanceof Array ? user.length : undefined,
            data: user
        }
    });
}


exports.sendResponseWithToken = sendResponseWithToken
exports.sendResponse = sendResponse
exports.sendError = sendError