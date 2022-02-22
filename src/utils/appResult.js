


class Result  {

    /**
     * @constructor
     * @param {boolean} success - whether operation failed or not
     * @param {any} value - http status code for the error
     * @param {Error} error - http status code for the error
     */
    constructor(success, value, error) {
        this.success = success;
        this.value = value;
        this.error = success;
    }
    static Ok(value=null){
        return new Result(true, value, null )
    }
    static Failure(error=null){
        console.log("error==", error)
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