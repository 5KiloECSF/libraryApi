/**
 * @class
 * general app custom error handler class.
 */
class AppError extends Error {

    /** 
     * @constructor
     * @param {string} message - general error message
     * @param {number} statusCode - http status code for the error
     */
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;