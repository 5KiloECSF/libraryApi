const AppError = require('../utils/app_error');
const {isProduction} = require("../utils/constants");
const {isDevelopment} = require("../utils/constants");

//sends development errors
const sendErrorDev = (err, resp) => {
    resp.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stackTrace: err.stackTrace
    })
}
const sendErrorProd = (err, resp) => {
    if (err.isOperational) {
        resp.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // unkown errors either programming or from the modules used
        console.error("Unkown error: ", err);

        resp.status(500).json({
            status: 'error',
            message: 'something went wrong!'
        });
    }

}

//=================  Different type of errors ===================
const handleDBcastError = err => {
    const message = `Invalid ${err.path} with value ${err.value}`;
    return new AppError(message, 400);
}

const handleDBduplicateError = err => {
    const message = `Attribute already exists. Duplicate field!`;
    return new AppError(message, 400);
}

const handleDBvalidationError = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = (err) => {
    message = "Invalid token. please login again!";
    return new AppError(message, 401);
}
const handleJWTExpireError = (err) => {
    message = "Expired token. please login again!";
    return new AppError(message, 401);
}

const global_error_handler = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (isDevelopment()) {
        sendErrorDev(err, res);
    } else if (isProduction()) {

        let error = { message: err.message, ...err };
        if (err.name === 'CastError') error = handleDBcastError(error);
        if (err.code === 11000) error = handleDBduplicateError(error);
        if (err.name === 'ValidationError') error = handleDBvalidationError(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTError(error);
        if (err.name === 'TokenExpiredError') error = handleJWTExpireError(error);

        sendErrorProd(error, res);
    }
};

module.exports= global_error_handler

