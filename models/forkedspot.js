var mongoose = require('mongoose');

var forkedspotSchema = mongoose.Schema({
    sid: String,
    desc: String,
    guidepost: [{ key: String, desc: String, nextSpot: String, background: String }],
    nextSpot: String,
    feedback: Schema.Types.Mixed,
    type: String,
    creator: String,
    createTime: Date,
    status: String
});
var Forkedspot = mongoose.model('Forkedspot', forkedspotSchema);
module.exports = Forkedspot;

