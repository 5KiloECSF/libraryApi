const AppError = require('../../utils/response/appError');
const {isProduction} = require("../../utils/constants");
const {isDevelopment} = require("../../utils/constants");
const ErrorStack = require('./errorModel');
const log_func=require("../../utils/logger")
const saveError = async err => {
    const newError = await ErrorStack.create({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });

    return newError.id;
};









//sends development errors
const sendErrorDev =async (err, resp) => {
    const errorId = await saveError(err);
    resp.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stackTrace: err.stackTrace
    })
}

const sendErrorProd =async (err, res) => {
    // A) API
    // if (req.originalUrl.startsWith('/api')) {
        // A) Operational, trusted error: send message to client
    const errorId = await saveError(err);
    if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: `${err.message} (${errorId})`
            });
        }

        // B) Programming or other unknown error: don't leak error details
        // 1) Log error
        console.error('ERROR 💥', err);
        // 2) Send generic message

        return res.status(500).json({
            status: 'error',
            message: `Something went wrong! (${errorId})`
        });
    // }

}

//=================  Different type of errors ===================
const handleDBcastError = err => {
    const message = `Invalid ${err.path} with value ${err.value}`;
    return new AppError(message, 400);
}

const handleDBduplicateFieldError = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
}

const handleDBvalidationError = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}


const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpireError = (err) => new AppError('Your token has expired! Please log in again.', 401)
//Functions
const global_error_handler = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    log_func("status==", {status:err.statusCode, name:err.name, message:err.message})

    if (isDevelopment()) {
        sendErrorDev(err, res);
    } else if (isProduction()) {

        let error = { message: err.message, ...err };
        if (err.name === 'CastError') error = handleDBcastError(error);
        if (err.code === 11000) error = handleDBduplicateFieldError(error);
        if (err.name === 'ValidationError') error = handleDBvalidationError(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTError(error);
        if (err.name === 'TokenExpiredError') error = handleJWTExpireError(error);

        sendErrorProd(error, res);
    }
};

module.exports= global_error_handler

