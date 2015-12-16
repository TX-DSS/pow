
var robot = require('../handlers/robot.js');
var cors = require('cors');

module.exports = function(app, credentials){

    var whitelist = ['http://admin.'+credentials.topdomain+':'+credentials.port];
    var corsOptions = {
        origin: function(origin, callback) {
            var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
            callback(null, originIsWhitelisted);
        }
    };

    // robot routes
    app.post('/', cors(corsOptions), robot.func);

};
