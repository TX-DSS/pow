
var main = require('./handlers/main.js');
var cors = require('cors');

module.exports = function(app){

    // routes
    app.get('/', main.home);
    app.get('/checkSignature', cors(), main.checkSignature);

    app.post('/checkSignature', cors(), main.handleMsg);
};
