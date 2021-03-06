
var _ = require('lodash');
var crypto = require('crypto');
var Forkedspot = require('../models/forkedspot.js');

function handleError(err, res) {
    res.json({
        isSuccess: false,
        err: err
    });
}

function sha1(str) {
    var sha1Gen = crypto.createHash("sha1");
    sha1Gen.update(str);
    return sha1Gen.digest("hex");
}

exports.createSpot = function(req, res, next){
    // console.log(req);
    var newSpot = new Forkedspot({
        spotType: req.body.spotType,
        summary: req.body.summary,
        description: req.body.description,
        guidepost: req.body.guidepost,
        creator: 'admin',
        createTime: new Date()
    });
    newSpot.save(function(err, result){
        if(err) handleError(err, res);
        res.json({
            isSuccess: true,
            result: {
                spotId: result.spotId
            }
        });
    });
};

exports.deleteSpot = function(req, res, next){
    var id = req.body._id;
    if (id) {
        Forkedspot.findById(id, function(err, spot) {
            if(err) handleError(err, res);

            spot.remove(function(err, result) {
                if (err) return handleError(err);
                res.json({
                    isSuccess: true,
                    result: {
                        spotId: result.spotId
                    }
                });
            });
        });
    }
};
exports.updateSpot = function(req, res, next){
    var id = req.body._id;
    if (id) {
        Forkedspot.findById(id, function(err, spot) {
            if(err) handleError(err, res);

            spot.spotType = req.body.spotType;
            spot.summary = req.body.summary;
            spot.description = req.body.description;
            spot.guidepost = req.body.guidepost;
            spot.updateTime = new Date();
            spot.save(function(err, result) {
                if (err) return handleError(err);
                res.json({
                    isSuccess: true,
                    result: {
                        spotId: result.spotId
                    }
                });
            });
        });
    }

    
};
exports.querySpot = function(req, res, next){
    Forkedspot.find({
        spotId: req.params.spotId
    }).
    exec(function(err, result){
        if (err) {
            res.json({
                isSuccess: false,
                err: err
            });
        }
        res.json({
            isSuccess: true,
            result: result
        });
    });

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

// exports.addSpot = function(req, content, cb){
//     // console.log(req);
//     // console.log(content);
//     var newSpot = new Forkedspot({
//         spotType: content.type,
//         summary: content.summary,
//         description: content.description,
//         guidepost: content.guidepost,
//         creator: 'admin',
//         createTime: new Date()
//     });
//     newSpot.save(function(err, a){
//         if(err) {
//             console.log(err);
//             return cb({ error: 'Unable to add Forkedspot.' });
//         }
//         cb(null, { id: a._id });
//     });
// };


