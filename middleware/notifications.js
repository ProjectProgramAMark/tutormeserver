var schedule = require('node-schedule');

var notifications = {};

notifications.scheduleJob = function (appointment) {
  // hardcoding job of sending notification to be an hour before appointment
  // need to change that later
  // also save job to database
  console.log("Jobtime is: ", appointment.time);
  var year = appointment.time.year;
  var month = appointment.time.month;
  var day = appointment.time.day;
  var hourStart = appointment.time.hourStart;
  var minuteStart = appointment.time.minuteStart;

  // year, month, day, hour, minute, second, and millisecond
  // var date = new Date(year, day, (hour - 1), minuteStart, 0, 0);

  // Debugging: making the date like 1 minute from now to see whether it works
  var date = new Date(Date.now() + 5000);
  var job = schedule.scheduleJob(date, function() {
    notifications.sendNotifciation(appointment);
    console.log("Job time activated, sending the notification now!");
  });

  // Debugging; cancelling the method right after, just making sure
  // there are no errors with the actual creation of the job
};



notifications.sendNotifciation = function (appointment) {
  console.log("Oh yeaaaaaaaaaah I'm Mr. Meeseeks!");
  console.log("variable that came through is: ", appointment);
  var date = appointment.time.month + "/" + appointment.time.day + "/" + appointment.time.year;
  var time = appointment.time.hourStart + ":" + appointment.time.minuteStart;
  // Dummy variables for now fam
  var payload = {
    notification: {
      title: "Appointment with " + appointment.tutorName,
      body: "at " + date + " on " + time
    }
/*   data: {
    tutor: appointment.tutorName,
    date: date,
    time: time
  } */
  };
  admin.messaging().sendToDevice(appointment.registrationToken, payload)
    .then(function(response) {
      console.log("Sent the message, here's the response: ", response);
    }).catch(function (err) {
      console.log("Error trying to send notification: ", err);
    });

};

module.exports = notifications;
