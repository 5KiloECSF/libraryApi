/**
 * @class
 * general result handler class.
 */
const log_func = require("../logger");

class Result {
    /**
     * @constructor
     * @param {boolean} success - whether operation failed or not
     * @param {any} value - http status code for the error
     * @param {Error} error - http status code for the error
     */
    constructor(success, value, error) {
        this.success = success;
        this.value = value;
        this.error = error;
    }
    static Ok(value, name="", log=false){
        // console.log("succesful operarion")
        if(log){
            log_func(name, value, "BgGreen")
        }
        return new Result(true, value, null )
    }
    static Failed(error=null, name=""){
        log_func( name, error,"BgRed")
        return new Result(false, null, error )
    }
    fail(){
        return ! this.success
    }
    succeed(){
        return this.success
    }
}

module.exports = Result;