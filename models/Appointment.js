var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var appointmentSchema = new Schema({
    studentEmail:   {type: String, required: true},
    tutorName:  {type: String, required: true},
    studentName: {type: String, required: true},
    time: {type: Object, required: true}
});

//TODO: consider changing fields in availableTimes database from string to int


var Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
