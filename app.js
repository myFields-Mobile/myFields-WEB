var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var expressSession = require('express-session');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var request = require('request');

var routes = require('./routes/index');
var webServiceUrl = require('./config/config').webServiceUrl;

if(process.env.MYFIELDS_API_URL) {
  webServiceUrl = process.env.MYFIELDS_API_URL;
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({secret:'supersecret'}));
app.use(passport.initialize());
app.use(passport.session());

/*
 Passport Setup
 */
passport.use(new LocalStrategy(
    function(username, password, done) {
      request.post(webServiceUrl + '/api/authenticate',
          {
            json: {
              email: username,
              password: password
            }
          },
          function(error, response, body) {
            console.log(error);
            if(error) {
              return done(null, false, error);
            } else if (!body.user) {
              return done(null, false, error);
            } else {
              var isAdmin = false;

              if(body.user.UserTypes) {
                body.user.UserTypes.forEach(function(currentType) {
                  if("admin" == currentType.title.toLowerCase()) {
                    isAdmin = true;
                  }
                });
              }

              body.user.isAdmin = isAdmin;

              return done(null, body);
            }
          });
    }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
/*
 End Passport Setup
 */

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
