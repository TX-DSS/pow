var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

var pageRuleSchema = new Schema({
    ruleId: { type: String, index: true, unique: true, required: true },
    baseURL: { type: String, index: true, required: true },
    titleArea: { type: String, required: true },
    authorArea: String,
    publishTimeArea: String,
    contentArea: { type: String, required: true },
    category: String,
    demoPageURL: String
});
pageRuleSchema.plugin(autoIncrement.plugin, {
    model: 'PageRule',
    field: 'ruleId',
    startAt: 10000,
    incrementBy: 1
});

var PageRule = mongoose.model('PageRule', pageRuleSchema);
module.exports = PageRule;
