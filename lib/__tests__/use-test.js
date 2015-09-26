'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

describe('Discourse User API', function () {

  var user_id = '';
  var username = 'react1';
  var password = '';

  it('logs in a user', function (done) {

    // username and password are assigned in previous test

    _api2['default'].login(username, password).then(function (res) {

      // make assertions
      should.exist(res);
      res.status.should.equal(200);

      var json = res.json();

      // make more assertions
      json.should.not.have.properties('error'); // todo - should this be in more places?
      json.should.have.properties('user');
      json.user.should.have.properties('username');
      json.user.username.should.equal(username);

      done();
    })['catch'](function (err) {
      should.not.exist(err);

      done();
    });
  });

  it('gets a user', function (done) {

    // username is assigned in previous test

    _api2['default'].getUser(username).then(function (user) {

      // make assertions
      should.not.exist(err);
      should.exist(user);

      // make more assertions
      user.should.have.properties('user');
      user.user.should.have.properties('id');

      done();
    })['catch'](function (err) {
      should.not.exist(err);

      done();
    });
  });
});