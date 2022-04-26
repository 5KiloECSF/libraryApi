const AppError = require('../../utils/response/appError');
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
const SetError=(err)=>{
    let error = { message: err.message, ...err };
    if (err.name === 'CastError') error = handleDBcastError(error);
    if (err.code === 11000) error = handleDBduplicateFieldError(error);
    if (err.name === 'ValidationError') error = handleDBvalidationError(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (err.name === 'TokenExpiredError') error = handleJWTExpireError(error);
    return error
}

module.exports=SetError