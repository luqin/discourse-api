'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

describe("category", function () {

  it('creates a category', function (done) {

    function makeid() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text.toUpperCase();
    }

    var category = _config2['default'].category;

    _api2['default'].createCategory({
      name: category.name + ' ' + makeid(),
      color: category.color,
      text_color: category.text_color,
      parent_category_id: category.parent_category_id
    }).then(function (res) {
      // make assertions
      should.exist(res);

      var json = JSON.parse(res);

      // make more assertions
      // json.should.have.properties('category');
      // json.category.id.should.be.above(0);

      done();
    });
  });

  it('gets category list', function (done) {

    _api2['default'].getCategories().then(function (json) {
      // make assertions
      should.exist(json);

      // make more assertions
      json.should.have.properties('category_list');

      done();
    })['catch'](function (err) {
      should.not.exist(err);

      done();
    });
  });
});