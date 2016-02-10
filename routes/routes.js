
var main = require('../handlers/main.js');
var cors = require('cors');

module.exports = function(app){

    // routes
    app.get('/', main.home);
    app.get('/login', main.login);
    app.get('/logout', main.logout);
    app.get('/checkSignature', cors(), main.checkSignature);

    app.post('/login', main.checkUser);
    app.post('/checkSignature', cors(), main.handleMsg);
};
