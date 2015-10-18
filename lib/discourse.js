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

    this.actionTypeEnum = actionTypeEnum;

    if (!fetch || !Promise) {
      throw Error('Can not find module Promise and fetch');
    }

    this.url = url;
    this.apiKey = apiKey;
    this.apiUsername = apiUsername;
  }

  /////////////////////
  // HELPERS
  /////////////////////

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
    }).then(checkStatus);
  };

  Discourse.prototype.put = function put(url, parameters) {
    return fetch(this.makeUrl(url), {
      method: 'put',
      body: parameters
    }).then(checkStatus);
  };

  Discourse.prototype['delete'] = function _delete(url, parameters) {
    return fetch(this.makeUrl(url), {
      method: 'delete',
      body: parameters
    }).then(checkStatus);
  };

  /////////////////////
  // USERS
  /////////////////////

  Discourse.prototype.createUser = function createUser(user) {
    return this.post('users', {
      'name': user.name,
      'email': user.email,
      'username': user.username,
      'password': user.password,
      'active': user.active
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

  Discourse.prototype.approveUser = function approveUser(id, username) {
    return this.put('admin/users/' + id + '/approve', { context: 'admin/users/' + username });
  };

  Discourse.prototype.activateUser = function activateUser(id, username) {
    return this.put('admin/users/' + id + '/activate', { context: 'admin/users/' + username });
  };

  Discourse.prototype.deleteUser = function deleteUser(id, username) {
    return this['delete'](id + '.json', { context: 'admin/users/' + username });
  };

  Discourse.prototype.login = function login(username, password) {
    return this.post('session', { 'login': username, 'password': password });
  };

  Discourse.prototype.logout = function logout(username) {
    return this['delete']('session/' + username, {});
  };

  Discourse.prototype.fetchConfirmationValue = function fetchConfirmationValue() {
    // discourse api should bypass the honeypot since it is a trusted user (confirmed via api key)
    return this.get('users/hp.json', {});
  };

  ///////////////////////
  // TOPICS AND REPLIES
  ///////////////////////

  Discourse.prototype.createTopic = function createTopic(title, raw, category) {
    return this.post('posts', {
      'title': title,
      'raw': raw,
      'category': category,
      'archetype': 'regular'
    });
  };

  Discourse.prototype.getCreatedTopics = function getCreatedTopics(username) {
    return this.get('user_actions.json', {
      username: username,
      filter: actionTypeEnum.NEW_TOPIC
    });
  };

  Discourse.prototype.replyToTopic = function replyToTopic(raw, topic_id) {
    return this.post('posts', { 'raw': raw, 'topic_id': topic_id });
  };

  Discourse.prototype.replyToPost = function replyToPost(raw, topic_id, reply_to_post_number) {
    return this.post('posts', {
      'raw': raw,
      'topic_id': topic_id,
      'reply_to_post_number': reply_to_post_number
    });
  };

  Discourse.prototype.getTopicAndReplies = function getTopicAndReplies(topic_id) {
    return this.get('t/' + topic_id + '.json', {});
  };

  Discourse.prototype.deleteTopic = function deleteTopic(topic_id) {
    return this['delete']('t/' + topic_id, {});
  };

  Discourse.prototype.updateTopic = function updateTopic(slug, topic_id, title, category) {
    return this.put('t/' + slug + '/' + topic_id, {
      title: title,
      category: category
    });
  };

  Discourse.prototype.updatePost = function updatePost(post_id, raw, edit_reason) {
    return this.put('posts/' + post_id, { 'post[raw]': raw, 'post[edit_reason]': edit_reason });
  };

  /////////////////////
  // PRIVATE MESSAGES
  /////////////////////

  // NOTE - It appears as though private messages are really just topics with a private flag. The original pm is assigned
  // a topic_id (and a post_id) and each reply is given a post_id.

  Discourse.prototype.createPrivateMessage = function createPrivateMessage(title, raw, target_usernames) {
    return this.post('posts', {
      'title': title,
      'raw': raw,
      'target_usernames': target_usernames,
      'archetype': 'private_message'
    });
  };

  Discourse.prototype.getPrivateMessages = function getPrivateMessages(username) {
    return this.get('topics/private-messages/' + username + '.json', {});
  };

  Discourse.prototype.getUnreadPrivateMessages = function getUnreadPrivateMessages(username, callback) {
    return this.get('topics/private-messages-unread/' + username + '.json', {});
  };

  Discourse.prototype.getPrivateMessageThread = function getPrivateMessageThread(topic_id) {
    return this.getTopicAndReplies(topic_id);
  };

  Discourse.prototype.getSentPrivateMessages = function getSentPrivateMessages(username) {
    return this.get('user_actions.json', {
      username: username,
      filter: actionTypeEnum.NEW_PRIVATE_MESSAGE
    });
  };

  Discourse.prototype.getReceivedPrivateMessages = function getReceivedPrivateMessages(username) {
    return this.get('user_actions.json', {
      username: username,
      filter: actionTypeEnum.GOT_PRIVATE_MESSAGE
    });
  };

  Discourse.prototype.replyToPrivateMessage = function replyToPrivateMessage(raw, topic_id) {
    return this.post('posts', { 'raw': raw, 'topic_id': topic_id });
  };

  /////////////////////
  // SEARCH
  /////////////////////

  Discourse.prototype.searchForUser = function searchForUser(username, callback) {
    return this.get('users/search/users.json', { term: username });
  };

  Discourse.prototype.search = function search(term) {
    return this.get('search.json', { term: term });
  };

  ///////////////
  // CATEGORIES
  ///////////////

  Discourse.prototype.createCategory = function createCategory(category) {
    return this.post('categories', {
      name: category.name,
      color: category.color || (~ ~(Math.random() * (1 << 24))).toString(16),
      text_color: category.text_color || 'FFFFFF',
      parent_category_id: category.parent_category_id || null
    });
  };

  Discourse.prototype.getCategories = function getCategories(parameters) {
    return this.get('categories.json', parameters).then(function (res) {
      return res.json();
    });
  };

  /////////////////////
  // Synchronous HELPER
  ////////////////////

  Discourse.prototype.getSync = function getSync(url, parameters) {
    return this.get(url, parameters);
  };

  Discourse.prototype.postSync = function postSync(url, parameters) {
    return this.post(url, parameters);
  };

  Discourse.prototype.putSync = function putSync(url, parameters) {
    return this.put(url, parameters);
  };

  Discourse.prototype.deleteSync = function deleteSync(url, parameters) {
    return this['delete'](url, parameters);
  };

  ///////////////////////////////////
  // Synchronous TOPICS AND REPLIES
  ///////////////////////////////////

  Discourse.prototype.createTopicSync = function createTopicSync(title, raw, category) {
    return this.postSync('posts', { 'title': title, 'raw': raw, 'category': category, 'archetype': 'regular' });
  };

  Discourse.prototype.getCreatedTopicsSync = function getCreatedTopicsSync(username) {
    return this.getSync('topics/created-by/' + (username || this.api_username) + '.json');
  };

  Discourse.prototype.updatePostSync = function updatePostSync(post_id, raw, edit_reason) {
    return this.putSync('posts/' + post_id, {
      post: {
        raw: raw,
        edit_reason: edit_reason
      }
    });
  };

  return Discourse;
})();

exports['default'] = Discourse;
module.exports = exports['default'];