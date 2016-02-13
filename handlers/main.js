//var fortune = require('../lib/fortune.js');
var _ = require('lodash');
var crypto = require('crypto');
var wxrobot = require('../lib/wxrobot.js');

function sha1(str) {
    var sha1Gen = crypto.createHash("sha1");
    sha1Gen.update(str);
    return sha1Gen.digest("hex");
}
function authentication(req, res) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
}

exports.home = function(req, res){
    authentication(req, res);
    res.render('home');
};

exports.workdiary = function(req, res){
    authentication(req, res);
    res.render('workdiary_home', {layout:'workdiary'});
};

exports.login = function(req, res){
    res.render('login');
};
exports.logout = function(req, res){
    req.session.user = null;
    res.redirect('/');
};
exports.checkUser = function(req, res){
    var user = {
        acctno: 'admin',
        name: '唐睿德',
        password: '123456'
    }
    if (req.body.acctno === user.acctno && req.body.password === user.password) {
        req.session.user = user;
        res.redirect('/workdiary');
    } else {
        req.session.error='用户名或密码不正确';
        res.redirect('/login');
    }
};

exports.about = function(req, res){
    res.render('about', {
        //fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    } );
};

exports.checkSignature = function(req, res, next){

    var signature = req.query.signature;
    var echostr = req.query.echostr;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;

    var oriArray = new Array();
    oriArray[0] = nonce;
    oriArray[1] = timestamp;
    oriArray[2] = credentials.weixin.token;
    oriArray.sort();

    var original = oriArray.join("");

    console.log("Original Str:" + original);
    console.log("Signature:" + signature);

    var scyptoStr = sha1(original);

    if ( signature == scyptoStr ) {
        res.send(echostr);
    } else {
        res.send("Bad Token");
    }

};

exports.handleMsg = function(req, res, next){

    var msg = "";
    req.on("data", function(data) {
        msg += data;
    });
    req.on("end", function() {
        console.log(msg);
        wxrobot.responseMsg(msg, res);
    });

    // console.log(JSON.stringify(req.query));
    // console.log(JSON.stringify(req.body));
    //res.send("success");
};
