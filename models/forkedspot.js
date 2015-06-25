var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var forkedspotSchema = new Schema({
    sid: String,
    type: String,
    summary: String,
    description: String,
    source: String,
    language: String,
    guidepost: [{ key: String, text: String, nextSpot: String, background: String }],
    nextSpot: String,
    feedback: Schema.Types.Mixed,
    creator: String,
    createTime: Date,
    status: String
});
var Forkedspot = mongoose.model('Forkedspot', forkedspotSchema);
module.exports = Forkedspot;

