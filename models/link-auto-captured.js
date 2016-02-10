var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var autoIncrement = require('mongoose-auto-increment');
//autoIncrement.initialize(mongoose);

var linkAutoCapturedSchema = new Schema({
    linkURL: { type: String, index: true, unique: true },
    linkTitle: String,
    sourceSite: String,
    ruleId: [String],
    status: String
});

var LinkAutoCaptured = mongoose.model('LinkAutoCaptured', linkAutoCapturedSchema);
module.exports = LinkAutoCaptured;
