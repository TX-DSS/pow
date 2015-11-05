//var fortune = require('../lib/fortune.js');
var _ = require('lodash');
var crypto = require('crypto');
var credentials = require('../credentials.js');
var wxrobot = require('../lib/wxrobot.js');

function sha1(str) {
    var sha1Gen = crypto.createHash("sha1");
    sha1Gen.update(str);
    return sha1Gen.digest("hex");
}

exports.home = function(req, res){
    res.render('home');
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