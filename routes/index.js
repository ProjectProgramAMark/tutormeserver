var express = require('express');
var router = express.Router();
var User = require('../models/User.js');
var Tutor = require('../models/Tutor.js');
var Appointment = require('../models/Appointment.js');

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
        times = _.map(times, function(time, key) { return {"hour": time.hour, "minute": time.minute}; });
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
  req.body.time.hour = req.body.time.hour.toString();
  req.body.time.minute = req.body.time.minute.toString();

  var appointment = new Appointment(req.body);
  appointment.save(function(err, appointment) {
    if (err) {
        console.log(err);
        return res.sendStatus(500);
    }
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


module.exports = router;
