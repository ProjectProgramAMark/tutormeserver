var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

// A Job is a job for reminding the user when their appointment is;
// it is responsible for the notifications

var jobSchema = new Schema({
    studentEmail:   {type: String, required: true},
    tutorName:  {type: String, required: true},
    studentName: {type: String, required: true},
    time: {type: Object, required: true},
    registrationToken: {type: String, required: true},
    notificationDate: {type: Date, required: true}
});

var Job = mongoose.model('Job', jobSchema);

module.exports = Job;
