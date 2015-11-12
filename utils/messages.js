module.exports = {
	_400: {
		invalidQueryParam: 'Invalid query parameter'
	},
	_401: {
		wrongPassword: 'Wrong password',
		unauthAcc: 'Unauthorized access'
	},
	_403: {
		forbiddenOp: 'Forbidden operation'
	},
	_404: {
		unknownUsrNam: 'Unknown username',
		usrNotFound: 'User not found'
	},
	_409: {
		usernameDuplicateMsg: 'Username already exists',
		sessionDuplicateMsg: 'Session already exists',
		postDuplicateMsg: 'Post already exists'
	},
	_500: {
		somethingWentWrong: 'Something went wrong'
	},
	schema: {
        required: '{PATH} is required',
        alreadyExists: '{PATH} "{VALUE}" already exists',
        invalid: 'invalid {PATH} "{VALUE}"',
        maxlength: '{PATH} cannot exceed {MAXLENGTH} characters',
        minlength: '{PATH} must contain at least {MINLENGTH} characters',
        users: {
            pwdlength: 'passwords should be between 8 and 16 characters',
            invalidPwd: 'passwords should contain at least 1 number'
        }
    }
};