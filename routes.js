
var main = require('./handlers/main.js');

module.exports = function(app){

    // routes
    app.get('/', main.home);

};
