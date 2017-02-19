var express = require('express');
var router = express.Router();
var User = require('../models/User.js');


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
      }

      res.json({authenticated: true});
    })
    .catch((err) => res.sendStatus(500));

});


module.exports = router;
