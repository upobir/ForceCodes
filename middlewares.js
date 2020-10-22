// middlware when not found - 404
function notFound(req, res, next){
    const error = new Error(`not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

// handling errors middlware
function errorHandler(error, req, res, next){
    const statusCode = res.statusCode == 200 ? 500 : res.statusCode;
    res.json({
        status : statusCode,
        message : error.message,
        stack : error.stack
    });
}

module.exports = {
    notFound, 
    errorHandler
};