var configStr = require('../../utils/config.strings');

module.exports = {
    db: 'mongodb://localhost/' + configStr.db.test,
    sessionSecret: 'developmentSessionSecret'
};