exports.getErrMsg = function(duplicateMsg, err) {
    var msg,
        defaultMsg = 'Something went wrong';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                return duplicateMsg;
            default:
                return defaultMsg;
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) {
                msg = err.errors[errName].message;
            }
        }
    }

    return msg || defaultMsg;
};