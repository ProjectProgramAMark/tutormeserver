var express = require('express');
var router = express.Router();
var User = require('../models/User.js');
var Tutor = require('../models/Tutor.js');
var Appointment = require('../models/Appointment.js');
var Job = require('../models/Job.js');
var notifications = require('../middleware/notifications');

//TODO: figure out how to globalize underscore library (not too important)
var _ = require('underscore');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/register', function(req, res, next) {
  // console.log(req.body);
    var user = new User({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email
    });
    user.save(function(err, user) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.status(201).json(user);
    });

});

router.post('/login', function(req, res, next) {
  // grab array of Users from mongoose here
  var email = req.body.email;
  var password = req.body.password;
  var query = {};
  query['email'] = email;
  query['password'] = password;
  User.findOne(query)
    .then((user) => {
      if(!user) {
        res.json({authenticated: false});
      } else {
        res.json({authenticated: true});
      }
    })
    .catch((err) => res.sendStatus(500));

});

router.get('/tutors', function (req, res, next) {
  // get the tutors
  Tutor.find({})
    .then((tutors) => {
      if(!tutors) {
        console.log("No tutors available!");
        res.sendStatus(404);
      } else {
        // console.log("Tutors are: ", tutors);
        res.status(200).send(tutors);
      }
    })
    .catch((err) => res.sendStatus(500));
});

router.get('/users', function (req, res, next) {
  // get the users
  User.find({})
    .then((users) => {
      if(!users) {
        console.log("No users available!");
        res.sendStatus(404);
      } else {
        // console.log("Users are: ", users);
        res.status(200).send(users);
      }
    })
    .catch((err) => res.sendStatus(500));
});

// Gets specific user based on email
router.get('/users/:userEmail', function (req, res, next) {
  console.log(req.params);
  var userEmail = req.params.userEmail;
  // get the user
  User.find({ "email": userEmail})
    .then((user) => {
      if(!user) {
        console.log("No users available!");
        res.sendStatus(404);
      } else {
        console.log("User is: ", user[0]);
        res.status(200).send(user[0]);
      }
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    })
});


router.get('/tutorAvailableTimes/:tutor/:date', function (req, res, next) {
  console.log(req.params);
  var tutorQuery = req.params.tutor;
  var dateQuery = JSON.parse(req.params.date);
  Tutor.find({"name": tutorQuery})
    .then((tutor) => {
      if(!tutor) {
        console.log("No tutors with this name found, error!");
        res.sendStatus(404);
      } else {
        // console.log("Tutor found! Tutor: ", tutor);
        // console.log("dateQuery: ", dateQuery);
        // console.log("Available times: ", tutor[0].availableTimes);
        var times = _.filter(tutor[0].availableTimes, function(availableTime) {
          // converting availableTimes.date stuff to int so can be properly compared
          availableTime.date.day = parseInt(availableTime.date.day);
          availableTime.date.month = parseInt(availableTime.date.month);
          availableTime.date.year = parseInt(availableTime.date.year);
          return _.isEqual(dateQuery, availableTime.date);
        });
        // Only need to return the hour and minute, so skimming the data here
        times = _.map(times, function(time, key) {
          return {
            "hourStart": time.hourStart,
            "minuteStart": time.minuteStart,
            "hourEnd": time.hourEnd,
            "minuteEnd": time.minuteEnd
          };
        });
        res.status(200).send(times);
      }
    }).catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

router.get('/tutorNames', function (req, res, next) {
  Tutor.find({}).select({ "name": 1, "_id": 0}).then((tutorNames) => {
    if(!tutorNames) {
      console.log("No tutors found in GET /tutorNames, error!");
      res.sendStatus(404);
    } else {
      // console.log("TutorNames: ", tutorNames);
      res.status(200).send(tutorNames);
    }
  }).catch(err => {
    console.log(err);
    res.sendStatus(500);
  });
});

router.post('/appointment', function (req, res, next) {
  // console.log("Req.body: ", req.body);

  // converting the time to strings to keep it consistent.
  // Might go back and change that later
  req.body.time.day = req.body.time.day.toString();
  req.body.time.month = req.body.time.month.toString();
  req.body.time.year = req.body.time.year.toString();
  req.body.time.hourStart = req.body.time.hourStart.toString();
  req.body.time.hourEnd = req.body.time.hourEnd.toString();
  req.body.time.minuteStart = req.body.time.minuteStart.toString();
  req.body.time.minuteEnd = req.body.time.minuteEnd.toString();

  var appointment = new Appointment(req.body);
  appointment.save(function(err, appointment) {
    if (err) {
        console.log(err);
        return res.sendStatus(500);
    }

    // call function here to schedule node-schedule Job
    // for sending notifications to the phone via FCM
    // save jobs to own database so if server goes offline
    // it recreates those jobs
    notifications.scheduleJob(req.body);

    return res.status(201).json(appointment);
  });
});

router.get('/appointment/:userEmail', function (req, res, next) {
  console.log(req.params.userEmail);
  var userEmail = req.params.userEmail;
  Appointment.find({studentEmail: userEmail}).then((appointments) => {
    if(!appointments) {
      console.log("This user has no appointments!");
      res.status(200).send(appointments);
    } else {
      res.status(200).send(appointments);
    }
  }).catch((err) => {
    console.log(err);
    res.sendStatus(500);
  });
});

router.delete('/appointment/:id', function (req, res, next) {
  var _id = req.params.id;
  Appointment.findByIdAndRemove(req.params.id, function (err, appointment) {
    if(err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      console.log("Successfully removed appointment: ", appointment);
      res.status(200).send(appointment);
    }
  });
});

router.get('/isTutor/:email', function (req, res, next) {
  console.log("req.params.email: ", req.params.email);
  var email = req.params.email;
  Tutor.find({email: email}).then((tutor) => {
    if(tutor.length == 0) {
      console.log("User is not a tutor, tutor functions denied! Tutor: ", tutor);
      res.status(403).json({forbidden: true});
    } else {
      // user is a tutor because email matched
      console.log("user is a tutor: ", tutor);
      res.status(200).json({forbidden: false});
    }
  }).catch((err) => {
    console.log(err);
    res.sendStatus(500);
  });
});

router.post('/updateToken', function (req, res, next) {
  console.log(req.body);
  var userEmail = req.body.userEmail;
  var newToken = req.body.newToken;
  User.findOneAndUpdate({ "email": userEmail}, {"registrationToken": newToken})
    .then((user) => {
      if(!user) {
        console.log("No users available!");
        res.sendStatus(404);
      } else {
        console.log("User is updated: ", user);
        res.json({"success": "true"});
      }
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });

// Since registration token for User was updated, need to reflect those changes in
// any Jobs they might have had scheduled on the database so the notification
// reaches the right device
  Job.find({"studentEmail": userEmail})
    .then((jobs) => {
      if(jobs.length == 0) {
        console.log("No jobs to update token for here!");
        return;
      } else {
        jobs.forEach(function(job) {
          console.log("updating registration token for: ", job);
          Job.findOneAndUpdate({ _id: job._id }, {registrationToken: newToken },
            function(err, newJob) {
              if(err) {
                throw err;
              } else {
                console.log("Job successfully updated: ", newJob);
              }
            });
        });
      }
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
});

module.exports = router;
