var model_names = require('./shared');

var mongoose = require('mongoose');
var tagSchema = mongoose.Schema;

tagSchema = mongoose.Schema({
    name: {type: String, required: true},
    // event_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.EVENT} ]
});

var Tag = mongoose.model(model_names.TAG, tagSchema);
module.exports = Tag;