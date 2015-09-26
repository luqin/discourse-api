/*eslint-env mocha */
import api from './api';
import config from './config';

describe('Discourse User API', () => {

  let user_id = '';
  let username = 'react1';
  let password = '';

  it('logs in a user', function (done) {

    // username and password are assigned in previous test

    api.login(username, password)
      .then(res=> {

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

      })
      .catch((err)=> {
        should.not.exist(err);

        done();
      });
  });

  it('gets a user', function (done) {

    // username is assigned in previous test

    api.getUser(username)
      .then(function (user) {

        // make assertions
        should.exist(user);

        // make more assertions
        user.should.have.properties('user');
        user.user.should.have.properties('id');

        done();

      })
      .catch((err)=> {
        should.not.exist(err);

        done();
      });

  });

});
