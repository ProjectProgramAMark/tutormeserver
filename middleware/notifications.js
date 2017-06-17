var schedule = require('node-schedule');
var Job = require('../models/Job.js');

var notifications = {};

notifications.scheduleJob = function (appointment) {
  // hardcoding job of sending notification to be an hour before appointment
  // need to change that later
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

  // Adding job to database to preserve them in case of server restart
  appointment.notificationDate = date;
  var jobObject = new Job(appointment);
  jobObject.save(function(err, job) {
    if (err) {
        console.log(err);
    }
    console.log("Job successfully saved! Job: ", job);
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


// This function is called in case of server reset
// it takes the Jobs from database and repopulates them so that notifications send
notifications.rePopulateNotifications = function() {
  Job.find(function(err, jobs) {
    if(err) {
      console.log("error with getting jobs from database: ", err);
      throw err;
      // return;
    }
    console.log("success with getting jobs from database. here are jobs: ", jobs);
    jobs.forEach(function(job) {
      console.log("scheduling job for: ", job);
      notifications.scheduleJobForRepopulation(job);
    });
  });
};

// Modified scheduleJob function for when repopulating jobs from database
// Happens every server startup
notifications.scheduleJobForRepopulation = function (jobDBObject) {
  date = jobDBObject.notificationDate;
  var job = schedule.scheduleJob(date, function() {
    notifications.sendNotifciation(jobDBObject);
    console.log("Job time activated, sending the notification now!");
  });

  // Debugging; cancelling the method right after, just making sure
  // there are no errors with the actual creation of the job
};

module.exports = notifications;
