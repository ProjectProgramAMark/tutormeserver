var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var tutorSchema = new Schema({
    email:   {type: String, required: true},
    name:  {type: String, required: true},
    availableTimes: {type: Array, required: true}
});

var Tutor = mongoose.model('Tutor', tutorSchema);

module.exports = Tutor;
