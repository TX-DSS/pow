var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

var pageRuleSchema = new Schema({
    ruleId: { type: String, index: true, unique: true },
    baseURL: { type: String, index: true },
    titleArea: String,
    authorArea: String,
    publishTimeArea: String,
    contentArea: String,
    category: String
});
pageRuleSchema.plugin(autoIncrement.plugin, {
    model: 'PageRule',
    field: 'ruleId',
    startAt: 10000,
    incrementBy: 1
});

var PageRule = mongoose.model('PageRule', pageRuleSchema);
module.exports = PageRule;
