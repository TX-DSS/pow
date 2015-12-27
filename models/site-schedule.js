var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var autoIncrement = require('mongoose-auto-increment');
//autoIncrement.initialize(mongoose);

var siteScheduleSchema = new Schema({
    siteURL: { type: String, index: true },
    targetArea: String,
    charset: String,
    schedule: String
});

var SiteSchedule = mongoose.model('SiteSchedule', siteScheduleSchema);
module.exports = SiteSchedule;
