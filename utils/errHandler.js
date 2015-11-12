messages = require('./messages');

exports.ErrMsg = function(statCode, msg) {
    this.statCode = statCode;
    this.msg = msg;
};

exports.getErrMsg = function(err, duplicateMsg) {
    var msg = messages._500.somethingWentWrong,
        statCode = 500;

    /*if (err.code) {
        console.log(err.code);
        switch (err.code) {
            case 11000:
            case 11001:
                if (duplicateMsg !== undefined) {
                    msg = duplicateMsg;
                    statCode = 409;
                    break;
                }
        }
    } else {*/
        for (var errName in err.errors) {
            if (err.errors[errName].message) {
                msg = err.errors[errName].message;
                statCode = 409;
            }
        }
    //}

    return new exports.ErrMsg(statCode, msg);
};

exports.handleErr = function(err, res, cb, duplicateMsg) {
    if (err) {
        var errMsg = exports.getErrMsg(err, duplicateMsg);
        res.status(errMsg.statCode).send(errMsg.msg);
    } else {
        cb();
    }
};