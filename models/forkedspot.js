var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

var forkedspotSchema = new Schema({
    spotId: { type: String, index: true, unique: true },
    spotType: { type: String, index: true },
    summary: String,
    description: String,
    source: String,
    language: String,
    guidepost: [{ key: String, text: String, nextSpot: String, background: String }],
    nextSpot: String,
    feedback: Schema.Types.Mixed,
    creator: String,
    createTime: Date,
    updateTime: Date,
    status: String
});
forkedspotSchema.plugin(autoIncrement.plugin, {
    model: 'Forkedspot',
    field: 'spotId',
    startAt: 10000,
    incrementBy: 1
});

var Forkedspot = mongoose.model('Forkedspot', forkedspotSchema);
module.exports = Forkedspot;

