

var Forkedspot = require('../models/forkedspot.js');

exports.addSpot = function(req, res, next){
    // console.log(req);
    var newSpot = new Forkedspot({
        spotType: req.body.type,
        summary: req.body.summary,
        description: req.body.description,
        guidepost: req.body.guidepost,
        creator: 'admin',
        createTime: new Date()
    });
    newSpot.save(function(err, result){
        if(err) {
            //console.log(err);
            res.json({
                isSuccess: false,
                err: err
            });
        }
        res.json({
            isSuccess: true,
            result: {
                spotId: result.spotId
            }
        });
    });
};

exports.deleteSpot = function(req, res, next){
    
};
exports.updateSpot = function(req, res, next){
    
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


