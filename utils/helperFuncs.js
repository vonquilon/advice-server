var constants = constants = require('./constants');

module.exports = {
    degToRad: function(deg) {
        return deg * (Math.PI/constants.DEG_PER_RAD);
    }
};