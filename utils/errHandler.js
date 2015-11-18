strings = require('./strings');

exports.ErrMsg = function(statCode, msg) {
    this.statCode = statCode;
    this.msg = msg;
};

exports.getErrMsg = function(err) {
    var msg = strings.statCode._500.somethingWentWrong,
        statCode = 500;

    for (var errName in err.errors) {
        if (err.errors.hasOwnProperty(errName) && err.errors[errName].message) {
            msg = err.errors[errName].message;
            statCode = 409;
        }
    }

    return new this.ErrMsg(statCode, msg);
};

exports.handleErr = function(err, res, cb) {
    if (err) {
        console.log(err);
        var errMsg = this.getErrMsg(err);
        res.status(errMsg.statCode).send(errMsg.msg);
    } else if (cb) {
        cb();
    }
};