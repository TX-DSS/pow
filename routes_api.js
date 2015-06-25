
var api = require('./handlers/api.js');

module.exports = function(app){

    // api routes
    app.post('/spot', api.addSpot);

};
