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
    app.post('/spot/create', cors(corsOptions), api.createSpot);
    app.post('/spot/delete', cors(corsOptions), api.deleteSpot);
    app.post('/spot/update', cors(corsOptions), api.updateSpot);
    app.get('/spot/:spotId', cors(), api.querySpot);
    
    //app.get('/checkSignature', cors(), api.checkSignature);
};
