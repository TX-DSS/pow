var api = require('./handlers/api.js');
var cors = require('cors');

var whitelist = ['http://pow.com:3000', 'http://admin.pow.com:3000'];
var corsOptions = {
    origin: function(origin, callback) {
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    }
};

module.exports = function(app) {

    // api routes
    app.post('/spot/add', cors(corsOptions), api.addSpot);
    app.post('/spot/delete', api.deleteSpot);
    app.post('/spot/update', api.updateSpot);
    app.get('/spot/:spotId', cors(), api.querySpot);

};
