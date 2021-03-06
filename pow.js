var http = require('http');
var express = require('express');

var app = express();



// set up handlebars view engine
var handlebars = require('express3-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        },
        static: function(name) {
            return require('./lib/static.js').map(name);
        }
    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// set up css/js bundling
// var bundler = require('connect-bundle')(require('./config.js'));
// app.use(bundler);

var credentials = null;
console.log(app.get('env'));
// logging
switch(app.get('env')){
    case 'development':
        // compact, colorful dev logging
        app.use(require('morgan')('dev'));
        credentials = require('./credentials.development.js');
        break;
    case 'production':
        // module 'express-logger' supports daily log rotation
        app.use(require('express-logger')({ path: __dirname + '/log/requests.log'}));
        credentials = require('./credentials.production.js');
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}

app.set('port', process.env.PORT || credentials.port);

var emailService = require('./lib/email.js')(credentials);

var MongoSessionStore = require('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({ url: credentials.mongo.connectionString });

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({ store: sessionStore }));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/webapps'));
app.use(require('body-parser')());

// database configuration
var mongoose = require('mongoose');
var options = {
    server: {
       socketOptions: { keepAlive: 1 }
    }
};
mongoose.connect(credentials.mongo.connectionString, options);

app.use(function(req, res, next) {
    if (!res.locals.userInfo) res.locals.userInfo = {};
    res.locals.userInfo = req.session.user;
    next();
});

var vhost = require('vhost');
// create "admin" subdomain...this should appear
// before all your other routes
var adminRouter = express.Router();
app.use(vhost('admin.'+credentials.topdomain, adminRouter));
require('./routes/routes_admin.js')(adminRouter);

// add robot routes
var robotRouter = express.Router();
app.use(vhost('robot.'+credentials.topdomain, robotRouter));
require('./routes/routes_robot.js')(robotRouter, credentials);

// add api routes
var apiRouter = express.Router();
app.use(vhost('api.'+credentials.topdomain, apiRouter));
require('./routes/routes_api.js')(apiRouter, credentials);
// var rest = require('connect-rest');
// var apiOptions = {
//     context: '/',
//     domain: require('domain').create(),
// };
// var apiRouter = rest.rester(apiOptions);
// require('./routes_api.js')(rest);

// add www routes
require('./routes/routes.js')(app);

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
    res.status(404);
    res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

var server;

function startServer() {
    server = http.createServer(app).listen(app.get('port'), function(){
      console.log( 'Express started in ' + app.get('env') +
        ' mode on http://localhost:' + app.get('port') +
        '; press Ctrl-C to terminate.' );
    });
}

if(require.main === module){
    // application run directly; start app server
    startServer();
} else {
    // application imported as a module via "require": export function to create server
    module.exports = startServer;
}
