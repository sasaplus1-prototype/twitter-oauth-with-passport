'use strict';

const twitter = require('twitter');

module.exports = function({
  consumerKey,
  consumerSecret,
  isAuthenticated,
  token,
  tokenSecret,
  userId,
}, callback) {
  if (isAuthenticated) {
    const client = new twitter({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token_key: token,
      access_token_secret: tokenSecret,
    });

    client.get('statuses/user_timeline', function(err, tweets, res) {
      if (err) {
        return callback(err);
      }

      callback(null, {
        isLoggedIn: true,
        json: JSON.stringify(JSON.parse(res.body), null, 2),
      });
    });
  } else {
    callback(null, {
      isLoggedIn: false,
      json: '',
    });
  }
};
