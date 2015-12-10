
var admin = require('../handlers/admin.js');

module.exports = function(app){

    // admin routes
    app.get('/', admin.home);
    app.get('/spot', admin.spot);

};
