class customError extends Error{
    constructor(message,status,name){
        super();
        this.message = message;
        this.status = status;
        this.name = name;
    }
}

module.exports = customError;