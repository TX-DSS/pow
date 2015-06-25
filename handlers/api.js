

var Forkedspot = require('../models/forkedspot.js');

exports.addSpot = function(req, content, cb){
    // console.log(req);
    // console.log(content);
    var newSpot = new Forkedspot({
        type: content.type,
        summary: content.summary,
        description: content.description,
        guidepost: content.guidepost,
        createTime: new Date()
    });
    newSpot.save(function(err, a){
        if(err) {
            return cb({ error: 'Unable to add Forkedspot.' });
        }
        cb(null, { id: a._id });
    });
};
