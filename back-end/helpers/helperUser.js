var jwt = require('jsonwebtoken');
var User = require('../models/user.model');

var tarequest = require('../models/taverify.model');
const adminurl = 'http://localhost:8000/admin';
const { validationResult } = require('express-validator');
var nodemailer = require('nodemailer');

module.exports = {
  respondJWT(user, res, successMessage) {
    /* Create a token by signing the user id with the private key. */
    var token = jwt.sign(
      { id: user._id, date: Date.now },
      process.env.JWT_SECRET,
      { expiresIn: 3600 } // token expires every 60 mins
    );

    /* Send the token back to client + some user info */
    res.status(200).json({
      user: {
        //user info
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      message: successMessage,
      token: token,
    });
  },

  /* To determine if token was verified, we check req.user is not null in the endpoint*/
  verifyToken(req, res, next) {
    if (
      req.headers &&
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'JWT'
    ) {
      jwt.verify(
        req.headers.authorization.split(' ')[1],
        process.env.JWT_SECRET,
        function (err, decode) {
          if (err) {
            req.user = undefined;
            console.log(err);
            next();
          }

          User.findOne({
            _id: decode.id, //this is the id we originally encoded with our JWT_SECRET
          }).exec((err, user) => {
            if (err) {
              res.status(500).send({
                message: err,
              });
            } else {
              req.user = user;
              next();
            }
          });
        }
      );
    } else {
      req.user = undefined;
      next();
    }
  },

  /* TODO: Use the methods in helperAdmin.js instead of the ones below */
  verifyTokenInBody(req, res, next) {
    if (req.body.token) {
      jwt.verify(
        req.body.token,
        process.env.JWT_SECRET,
        function (err, decode) {
          if (err) {
            req.user = undefined;
            console.log(err);
            next();
          }

          User.findOne({
            _id: decode.id, //this is the id we originally encoded with our JWT_SECRET
          }).exec((err, user) => {
            if (err) {
              res.status(500).send({
                message: err,
              });
            } else {
              req.user = user;
              next();
            }
          });
        }
      );
    } else {
      req.user = undefined;
      next();
    }
  },
  async renderusers(req, res) {
    var users = await User.find({});
    var list = [];
    for (x in users) {
      list.push(users[x].firstName + ' ' + users[x].lastName + ' ');
    }
    res.render('users', {
      title: 'Users',
      message: 'Manage users',
      url: adminurl,
      users: users,
      token: req.body.token,
    });
  },
  async renderrequests(req, res) {
    var requests = await tarequest.find({});
    var list = [];
    for (x in requests) {
      list.push(requests[x].firstName + ' ' + requests[x].lastName + ' ');
    }
    res.render('requests', {
      title: 'Requests',
      message: 'Manage TA verification requests',
      url: adminurl,
      requests: requests,
      token: req.body.token,
    });
  },
  renderadminlogin(req, res, err, code) {
    res.status(code).render('login', {
      title: 'Login',
      url: adminurl,
      errors: err,
    });
  },
  handleValidationResult(req, res, err) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      err.push(...errors.array().toString());
    }
  },
  handleInvalidJWT(req, res, err) {
    if (!req.user) {
      res.status(401).send({ message: 'Invalid JWT token' });
      err.push('Invalid JWT token');
    }
  },

  stripSensitiveInfo(userObj) {
    var sensInfo = [
      'email',
      'password',
      'verified',
      'created',
      'savedStudygroups',
    ];
    sensInfo.forEach(elem => {
      userObj = removeProperty(elem, userObj);
    });
  },
  async getUserDetailsNonSens(usersId, errors) {
    var users = await User.find({
      _id: { $in: usersId },
    }).catch(err => errors.push('Err: ' + err));
  },

  //rec_email can be list or single user
  async sendEmail(rec_email, subject, message) {
    let password = process.env.password;
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'studtogtest@gmail.com',
        pass: password,
      },
      secure: true,
    });
    let msg = {
      from: 'studtogtest@gmail.com', // sender address
      to: `${rec_email}`, // list of receivers
      subject: subject,
      text: message,
      html: `<p>${message}</p><br><img src="cid:logo" style="width:412px;height:70"/>`,
      attachments: [
        {
          filename: 'logoblack.png',
          path: './logo/logoblack.png',
          cid: 'logo',
        },
      ],
    };
    await transporter.sendMail(msg);
  },
  constructMessage(title, start, end, messageNum) {
    let startTime = this.dateParser(start);
    let endTime = this.dateParser(end);

    let string = `<strong>${title}</strong> on <strong>${start.toDateString()}</strong> from <strong>${
      startTime.hours
    }:${startTime.mins} ${startTime.mornOrEve}</strong> till <strong>${
      endTime.hours
    }:${endTime.mins} ${endTime.mornOrEve}</strong><br>`;
    if (messageNum == 0) {
      string += ' has become:<br>';
    } else if (messageNum == 1) {
      string += '<br>';
    } else {
      string += 'has been cancelled<br><br>';
    }
    return string;
  },
  dateParser(date) {
    let startHours = `${date.getHours()}`;
    let mornOrEveStart;
    if (startHours > 12) {
      startHours = startHours - 12;
      mornOrEveStart = 'PM';
    } else if (startHours == 12) {
      mornOrEveStart = 'PM';
    } else if (startHours == 0) {
      mornOrEveStart = 'AM';
      startHours = 12;
    } else {
      mornOrEveStart = 'AM';
    }
    let startMins = `${date.getMinutes()}`;
    if (startHours.length < 2) startHours = '0' + startHours;
    if (startMins.length < 2) startMins = '0' + startMins;

    return { hours: startHours, mins: startMins, mornOrEve: mornOrEveStart };
  },
};
