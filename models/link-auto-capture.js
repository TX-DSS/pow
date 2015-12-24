var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

var linkAutoCaptureSchema = new Schema({
    linkURL: { type: String, index: true },
    linkTitle: String,
    sourceSite: String,
    ruleId: String,
    state: String
});

var LinkAutoCapture = mongoose.model('LinkAutoCapture', linkAutoCaptureSchema);
module.exports = LinkAutoRobot;
