class HttpConvertibleError extends Error {

    constructor(msg, statusCode) {
        super(msg);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
    }
}

class NotFoundError extends HttpConvertibleError {
    constructor(msg) { super(msg, 404); }
}

class NotAcceptableError extends HttpConvertibleError {
    constructor(msg) { super(msg, 406); }
}

class ConflictError extends HttpConvertibleError {
    constructor(msg) { super(msg, 409); }
}

module.exports = {
    HttpConvertibleError,
    NotFoundError,
    NotAcceptableError,
    ConflictError,
};