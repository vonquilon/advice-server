exports.ErrMsg = function(statCode, msg) {
    this.statCode = statCode;
    this.msg = msg;
};

exports.getErrMsg = function(duplicateMsg, err) {
    var msg = 'Something went wrong',
        statCode = 500;

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                msg = duplicateMsg;
                statCode = 409;
                break;
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) {
                msg = err.errors[errName].message;
                statCode = 409;
            }
        }
    }

    return new exports.ErrMsg(statCode, msg);
};