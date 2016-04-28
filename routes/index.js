var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var Recaptcha = require('recaptcha').Recaptcha;
var webServiceUrl = require('../config/config').webServiceUrl;
var PUBLIC_KEY = "unknown_key", PRIVATE_KEY = "unknown_key";

if(process.env.MYFIELDS_API_URL) {
  webServiceUrl = process.env.MYFIELDS_API_URL;
}

if(process.env.RECAPTCHA_PUBLIC_KEY) {
  PUBLIC_KEY = process.env.RECAPTCHA_PUBLIC_KEY
}

if(process.env.RECAPTCHA_PRIVATE_KEY) {
  PRIVATE_KEY = process.env.RECAPTCHA_PRIVATE_KEY;
}

/**
 * GET - Index page
 */
router.get('/', isAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Express', user: req.user.user });
});

/**
 * GET - Login page
 */
router.get('/login', function(req, res, next) {
  res.render('login', {
    error: req.query.error
  });
});

/**
 * POST - Login page
 */
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login?error=Invalid+email+or+password'
}));

/**
 * GET - signup
 */
router.get('/signup', function(req, res, next) {
  var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY);
  console.log(req.query);

  res.render('signup', {
    recaptcha_form: recaptcha.toHTML(),
    error: req.query.error
  });
});

/**
 * POST - signup
 */
router.post('/signup', function(req, res, next) {
  var reqBody = req.body;

  if(!reqBody.email || !reqBody.firstName || !reqBody.password || !reqBody.repeatPassword || !reqBody.lastName || !reqBody.phone) {
    res.redirect('/signup?error=All+fields+are+required');
  } else if(reqBody.password != reqBody.repeatPassword) {
    res.redirect('/signup?error=Passwords+do+not+match');
  } else {
    var data = {
      remoteip:  req.connection.remoteAddress,
      challenge: req.body.recaptcha_challenge_field,
      response:  req.body.recaptcha_response_field
    };

    var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY, data);

    recaptcha.verify(function(success, error_code) {
      if (success) {
        request.post(webServiceUrl + '/api/user/create',
            {
              json: {
                email: req.body.email,
                firstName: req.body.firstName,
                password: req.body.password,
                lastName: req.body.lastName,
                phone: req.body.phone
              }
            },
            function(error, response, body) {

              if(body.errors) {
                res.redirect('/signup?error=Email+is+already+taken');
              } else {
                res.redirect('/login');
              }
            });
      }
      else {
        // Redisplay the form.
        res.redirect('/signup?error=Incorrect+Captcha+Response');
      }
    });
  }
});

//todo rename the admin/list endpoint to something related to permissions

/**
 * GET - Assign inspectors page
 */
router.get('/admin/assign', isAuthenticated, function(req, res, next) {
    res.render('Admin/assign', {title: 'Assign Inspector', user: req.user.user });
});

/**
 * Get - List of inspections pages
 */
router.get('/admin/list', isAuthenticated, function(req, res, next) {
    res.render('Admin/list', {title: 'User Permissions', user: req.user.user });
});

/**
 * GET - Field create page
 */
router.get('/field/create', isAuthenticated, function(req, res, next) {
    res.render('Field/create', {title: 'Create Field', user: req.user.user });
});

/**
 * POST - Field create
 */
router.post('/field/create', isAuthenticated, function(req, res, next) {
    request.post(webServiceUrl + '/api/field/create',
        {
            json: {
                name: req.body.name,
                BoundaryId: req.body.BoundaryId,
                IrrigationId: req.body.IrrigationId,
                TillageId: req.body.TillageId,
                CropId: req.body.CropId
        },
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * GET - list Fields page
 */
router.get('/field/list', isAuthenticated, function(req, res, next) {
    res.render('Field/list', {title: 'Your Fields', user: req.user.user });
});

/**
 * GET - get active fields
 */
router.get('/api/field/me', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/field/me/',
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * GET - get all fields
 */
router.get('/api/field/all', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/field/all',
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * GET - activate field
 */
router.get('/api/field/:id(\\d+)/activate', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/field/' + req.params.id + "/activate",
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * GET - deactivate field
 */
router.get('/api/field/:id(\\d+)/deactivate', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/field/' + req.params.id + "/deactivate",
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});



/**
 * GET - Boundary create page
 */
router.get('/boundary/create', isAuthenticated, function(req, res, next) {
  res.render('Boundary/create', {title: 'Create Boundary', user: req.user.user });
});

/**
 * GET - Admin Get Users
 */

router.get('/admin/users', isAuthenticated, function(req, res, next){
    request.get(webServiceUrl + '/api/admin/users',
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});
/**
 * GET -  Admin Get Types
 */
router.get('/admin/types', isAuthenticated, function(req, res, next){
    request.get(webServiceUrl + '/api/admin/types',
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});


/**
 * removes selected usertype
 */

router.post('/admin/:id(\\d+)/remove', isAuthenticated, function(req, res, next){
    request.post(webServiceUrl + '/api/admin/'+req.params.id+'/remove',
        {
            headers: {
                'x-access-token': req.user.token
            },
            json: {
                title: req.body.title
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * calls the api to add a type to a user
 */

router.post('/admin/:id(\\d+)/add', isAuthenticated, function(req, res, next){

    request.post(webServiceUrl + '/api/admin/'+req.params.id+'/add',
        {
            headers: {
                'x-access-token': req.user.token
            },
            json: {
                title: req.body.title
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});


/**
 * GET -list all the users
 */

router.get('/api/user/all', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/user/all',
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * POST - Boundary create
 */
router.post('/boundary/create', isAuthenticated, function(req, res, next) {
  request.post(webServiceUrl + '/api/boundary/create',
      {
        json: {
          name: req.body.name,
          points: req.body.outerPoints,
          cutoutPoints: req.body.cutoutPoints
        },
        headers: {
          'x-access-token': req.user.token
        }
      },
      function(error, response, body) {
        if(error) {
          res.status(500).send(error);
        } else {
          res.send(body);
        }
      });
});

/**
 * GET - list Boundaries page
 */
router.get('/boundary/list', isAuthenticated, function(req, res, next) {
    res.render('Boundary/list', {title: 'Your Boundaries', user: req.user.user });
});

/**
 * GET - get active boundaries
 */
router.get('/api/boundary', isAuthenticated, function(req, res, next) {
  request.get(webServiceUrl + '/api/boundary/',
      {
        headers: {
          'x-access-token': req.user.token
        }
      },
      function(error, response, body) {
        if(error) {
          res.status(500).send(error);
        } else {
          res.send(body);
        }
      });
});
//TODO figure out which of these routes ('/api/boundary/all','/api/boundary') needs to go.
/**
 * GET - get active boundaries
 */
router.get('/api/boundary/all', isAuthenticated, function(req, res, next) {
  request.get(webServiceUrl + '/api/boundary/all',
      {
        headers: {
          'x-access-token': req.user.token
        }
      },
      function(error, response, body) {
        if(error) {
          res.status(500).send(error);
        } else {
          res.send(body);
        }
      });
});

/**
 * POST - update boundary
 */
router.post('/api/boundary/:id(\\d+)/update', isAuthenticated, function(req, res, next) {
  request.post(webServiceUrl + '/api/boundary/' + req.params.id + "/update",
      {
        headers: {
          'x-access-token': req.user.token
        },
        json: {
          active: req.body.active
        }
      },
      function(error, response, body) {
        if(error) {
          res.status(500).send(error);
        } else {
          res.send(body);
        }
      });
});

/**
 * GET - list inspections
 */
router.get('/inspection/list', isAuthenticated, function(req, res, next) {
  res.render('Inspection/list', {title: 'Your Inspections', user: req.user.user });
});

/**
 * GET - create inspections
 */
router.get('/inspection/create', isAuthenticated, function(req, res, next) {
  res.render('Inspection/create', { title: 'Create Inspection', user: req.user.user });
});

/**
 * POST - create inspections
 */
router.post('/inspection/create', isAuthenticated, function(req, res, next) {
    request.post(webServiceUrl + '/api/inspection/create',
        {
            json: {
                FieldId: req.body.FieldId
            },
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * POST - assign inspections
 */
router.post('/api/inspection/:id(\\d+)/assign', isAuthenticated, function(req, res, next) {
    request.post(webServiceUrl + '/api/inspection/'+req.params.id+'/assign',
        {
            json: {
                inspector_id: req.body.inspector_id
            },
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});
/**
 * GET - accept inspection
 */
router.get('/api/inspection/:id(\\d+)/accept', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/inspection/' + req.params.id + "/accept",
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * GET - decline inspection
 */
router.get('/api/inspection/:id(\\d+)/decline', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/inspection/' + req.params.id + "/decline",
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});
/**
 * GET - activate inspection
 */
router.get('/api/inspection/:id(\\d+)/activate', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/inspection/' + req.params.id + "/activate",
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * GET - deactivate inspection
 */
router.get('/api/inspection/:id(\\d+)/deactivate', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/inspection/' + req.params.id + "/deactivate",
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * GET - get active inspections
 */
router.get('/api/inspection/requested', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/inspection/requested',
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * GET - get all inspections
 */
router.get('/api/inspection/requested/all', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/inspection/requested/all',
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * GET - get all inspections
 */
router.get('/api/inspection/all', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/inspection/all',
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});
///**
// * GET - get active requested inspections
// */
//router.get('/api/inspection/requested', isAuthenticated, function(req, res, next) {
//    request.get(webServiceUrl + '/api/inspection/requested',
//        {
//            headers: {
//                'x-access-token': req.user.token
//            }
//        },
//        function(error, response, body) {
//            if(error) {
//                res.status(500).send(error);
//            } else {
//                res.send(body);
//            }
//        });
//});

/**
 * GET - get all requested inspections
 */
router.get('/api/inspection/requested/all', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/inspection/requested/all',
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * GET - get active irrigation
 */
router.get('/api/irrigation', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/irrigation/',
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * GET - get active tillages
 */
router.get('/api/tillage', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/tillage/',
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * GET - get active crops
 */
router.get('/api/crop', isAuthenticated, function(req, res, next) {
    request.get(webServiceUrl + '/api/crop/',
        {
            headers: {
                'x-access-token': req.user.token
            }
        },
        function(error, response, body) {
            if(error) {
                res.status(500).send(error);
            } else {
                res.send(body);
            }
        });
});

/**
 * GET - get active crops
 */
router.get('/api/field', isAuthenticated, function(req, res, next) {
  request.get(webServiceUrl + '/api/field/',
    {
      headers: {
        'x-access-token': req.user.token
      }
    },
    function(error, response, body) {
      if(error) {
        res.status(500).send(error);
      } else {
        res.send(body);
      }
    });
});


/**
 * POST - reset password
 */
router.post('/api/reset-password', isAuthenticated, function(req, res, next) {
  console.log(req.body);
  var originalPassword = req.body.originalPassword;
  var newPassword = req.body.newPassword;
  var repeatedNewPassword = req.body.repeatedNewPassword;

  if(!originalPassword || !newPassword || !repeatedNewPassword) {
    res.render('account', {
      title: 'Account',
      user: req.user.user,
      error: "You must fill out all password fields"
    });
  } else if(newPassword !== repeatedNewPassword) {
    res.render('account', {
      title: 'Account',
      user: req.user.user,
      error: "New passwords do not match"
    });
  } else {
    request.post(webServiceUrl + '/api/user/password-reset',
      {
        headers: {
          'x-access-token': req.user.token
        },
        json: req.body
      },
      function(error, response, body) {
        console.log(error);
        console.log(response);
        console.log(body);
        if(error) {
          res.render('account', {
            title: 'Account',
            user: req.user.user,
            error: error.message
          });
        } else {
          res.render('account', {
            title: 'Account',
            user: req.user.user,
            error: body.message
          });
        }
      });
  }
});

/* GET logout page */
router.get('/logout', function(req, res, next) {
  req.session.destroy();
  res.redirect('/login');
});

router.get('/account', isAuthenticated, function(req, res, next) {
  res.render('account', {
    title: 'Account',
    user: req.user.user
  });
});

router.get('/current', isAuthenticated, function(req, res, next) {
  res.send(req.user);
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/login');
}

module.exports = router;
