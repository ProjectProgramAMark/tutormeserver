var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var userSchema = new Schema({
    email:   {type: String, required: true},
    password: {type: String, required: true},
    name:  {type: String, required: true}
});

var User = mongoose.model('User', userSchema);

module.exports = User;
