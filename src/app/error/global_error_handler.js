
const {isProduction} = require("../../config/constants");
const {isDevelopment} = require("../../config/constants");
const ErrorStack = require('./errorModel');
const log_func=require("../../utils/logger")
const SetError= require('./dtErrors')

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


//Functions
const global_error_handler = async (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    log_func("status==", {status:err.statusCode, name:err.name, message:err.message})
    if (isDevelopment()) {
        await sendErrorDev(err, res);
    } else if (isProduction()) {
        let error = SetError(err)
        await sendErrorProd(error, res);
        err.status = err.status || 'error';
    }else {
        await sendErrorProd(error, res);
    }

};




const handleError= async (err, res)=>{
    err.statusCode = err.statusCode || status;
    if (isDevelopment()) {
        log_func("dev")
        await sendErrorDev(err, res);
    } else if (isProduction()) {
        log_func('prod')
        let error = SetError(err)
        await sendErrorProd(error, res);
        err.status = err.status || 'error';
    }else {
        log_func("in Else")
        await sendErrorProd(error, res);
    }

}

exports.handleError=handleError
module.exports= global_error_handler

