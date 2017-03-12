'use strict';

const {
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  CALLBACK_PATH,
} = process.env;

if (!TWITTER_CONSUMER_KEY || !TWITTER_CONSUMER_SECRET || !CALLBACK_PATH) {
  throw new Error('need TWITTER_CONSUMER_KEY and TWITTER_CONSUMER_SECRET and CALLBACK_PATH');
}

//------------------------------------------------------------------------------

const util = require('util');

const passport = require('passport'),
      TwitterStrategy = require('passport-twitter').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(
  new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: `http://localhost:8000${CALLBACK_PATH}`,
  }, function(token, tokenSecret, profile, done) {
    process.nextTick(function() {
      done(null, Object.assign({}, profile, {
        token,
        tokenSecret,
      }));
    });
  })
);

//------------------------------------------------------------------------------

const express = require('express'),
      expressSession = require('express-session'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');
app.set('x-powered-by', false);

app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(expressSession({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
  },
}));
app.use(passport.initialize());
app.use(passport.session());

//------------------------------------------------------------------------------

app.get('/', function(req, res) {
  const index = require('./models/index');

  index({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    isAuthenticated: req.isAuthenticated(),
    token: (req.user || {}).token,
    tokenSecret: (req.user || {}).tokenSecret,
    userId: (req.user || {}).id,
  }, function(err, data) {
    if (err) {
      console.error(err);
      console.error(err.stack);

      return res.status(500).end();
    }

    res.render('index', Object.assign({}, data, { _with: false }));
  });
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/login',
  passport.authenticate('twitter')
);

app.get(
  CALLBACK_PATH,
  passport.authenticate(
    'twitter', {
    failureRedirect: '/login'
  }), function(req, res) {
    res.redirect('/');
  }
);

app.listen(8000, function() {
  console.log('start server');
});
