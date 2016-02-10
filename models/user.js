var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var autoIncrement = require('mongoose-auto-increment');
//autoIncrement.initialize(mongoose);

var userSchema = new Schema({
    name: { type: String, index: true, unique: true, required: true },
    password: { type: String, required: true },
    type: String,
    status: String
});

var User = mongoose.model('User', userSchema);
module.exports = SiteSchedule;
