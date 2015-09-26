'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('es6-promise');

require('whatwg-fetch');

var _Discourse = require('../Discourse');

var _Discourse2 = _interopRequireDefault(_Discourse);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var api = new _Discourse2['default'](_config2['default'].url, _config2['default'].api.key, _config2['default'].api.username);

module.exports = api;