strings = require('./strings');

exports.ErrMsg = function(statCode, msg) {
    this.statCode = statCode;
    this.msg = msg;
};

exports.getErrMsg = function(err) {
    var msg = strings.statCode._500.somethingWentWrong,
        statCode = 500;

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                console.log('----START----');
                console.log(err.message);
                var path = err.message.match(/\$.*\_/g)[0];
                console.log(path);
                var val = err.message.match(/\".*\"/g)[0];
                console.log(val);
                msg = strings.statCode._409.alreadyExists(
                    path.substring(1, path.length - 1), val
                );
                statCode = 409;
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors.hasOwnProperty(errName) && err.errors[errName].message) {
                msg = err.errors[errName].message;
                statCode = 409;
            }
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