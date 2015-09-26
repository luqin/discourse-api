'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _componentQuerystring = require('component-querystring');

var _componentQuerystring2 = _interopRequireDefault(_componentQuerystring);

var actionTypeEnum = {
  LIKE: 1,
  WAS_LIKED: 2,
  BOOKMARK: 3,
  NEW_TOPIC: 4,
  REPLY: 5,
  RESPONSE: 6,
  MENTION: 7,
  QUOTE: 9,
  STAR: 10,
  EDIT: 11,
  NEW_PRIVATE_MESSAGE: 12,
  GOT_PRIVATE_MESSAGE: 13
};

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  var error = new Error(response.statusText);
  error.response = response;
  throw error;
}

var Discourse = (function () {
  function Discourse(url, apiKey, apiUsername) {
    _classCallCheck(this, Discourse);

    if (!fetch || !Promise) {
      throw Error('Can not find module Promise and fetch');
    }

    this.url = url;
    this.apiKey = apiKey;
    this.apiUsername = apiUsername;
  }

  Discourse.prototype.makeUrl = function makeUrl(url, parameters) {
    var newUrl = this.url + '/' + url + '?api_key=' + this.apiKey + '&api_username=' + this.apiUsername;

    if (parameters) {
      newUrl += '&' + _componentQuerystring2['default'].stringify(parameters);
    }

    return newUrl;
  };

  Discourse.prototype.get = function get(url, parameters) {
    return fetch(this.makeUrl(url, parameters), {
      credentials: 'same-origin'
    }).then(checkStatus);
  };

  Discourse.prototype.post = function post(url, parameters) {
    return fetch(this.makeUrl(url), {
      method: 'post',
      credentials: 'same-origin',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parameters)
    });
  };

  Discourse.prototype.put = function put(url, parameters) {
    return fetch(this.makeUrl(url), {
      method: 'put',
      body: parameters
    });
  };

  Discourse.prototype.getUser = function getUser(username) {
    return this.get('users/' + username + '.json').then(function (response) {
      var json = response.json();
      if (json.user && json.user.id) {
        return json;
      } else {
        return null;
      }
    });
  };

  Discourse.prototype.login = function login(username, password) {
    return this.post('session', { 'login': username, 'password': password });
  };

  Discourse.prototype.createCategory = function createCategory(category) {
    return this.post('categories', {
      method: 'post',
      body: {
        name: category.name,
        color: category.color || (~ ~(Math.random() * (1 << 24))).toString(16),
        text_color: category.text_color || 'FFFFFF',
        parent_category_id: category.parent_category_id || null
      }
    });
  };

  Discourse.prototype.getCategories = function getCategories(parameters) {
    return this.get('categories.json', parameters).then(function (res) {
      return res.json();
    });
  };

  Discourse.prototype.getCreatedTopics = function getCreatedTopics(username) {
    return this.get('user_actions.json', {
      username: username,
      filter: actionTypeEnum.NEW_TOPIC
    });
  };

  return Discourse;
})();

exports['default'] = Discourse;
module.exports = exports['default'];