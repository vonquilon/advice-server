module.exports = {
	headerNames: {
        email: 'x-email',
        password: 'x-password',
        userId: 'x-user-id',
        accessToken: 'x-access-token',
        latitude: 'x-latitude',
        longitude: 'x-longitude',
        radius: 'x-radius'
    },
    statCode: {
        _400: {
            invalidQueryParam: 'invalid query parameter',
            invalidGPSCoords: 'invalid gps coordinates (-90 <= latitude <= 90, -180 <= longitude <= 180)',
            invalidRadius: 'invalid radius (5 <= radius <= 10)'
        },
        _401: {
            wrongPassword: 'wrong password',
            unauthAcc: 'unauthorized access'
        },
        _403: {
            forbiddenOp: 'forbidden operation'
        },
        _404: {
            unknownEmail: 'unknown email',
            usrNotFound: 'user not found',
            sessionNotFound: 'session not found'
        },
        _409: {
            usernameDuplicateMsg: 'Username already exists',
            sessionDuplicateMsg: 'Session already exists',
            postDuplicateMsg: 'Post already exists',
            alreadyUsed: function(path) {
                return "you're already using that " + path;
            },
            alreadyExists: function(path, val) {
                var msg = '';
                msg += path ? path : '{PATH}';
                msg += ' ';
                msg += val ? val : '"{VALUE}"';
                return msg + ' already exists';
            }
        },
        _500: {
            somethingWentWrong: 'something went wrong'
        }
    },
	schema: {
        required: '{PATH} is required',
        alreadyExists: '{PATH} "{VALUE}" already exists',
        invalid: 'invalid {PATH} "{VALUE}"',
        maxlength: '{PATH} cannot exceed {MAXLENGTH} characters',
        minlength: '{PATH} must contain at least {MINLENGTH} characters',
        users: {
            pwdlength: 'passwords should be between 8 and 16 characters',
            invalidPwd: 'passwords should contain at least 1 number',
			invalidUsrNam: "usernames must be at least 2 characters in [(a-z),(0-9),-,_,',.]"
        }
    }
};