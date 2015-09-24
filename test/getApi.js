function getApi(config) {
  var Discourse = require('../lib/discourse');

  return new Discourse(config.url, config.api.key, config.api.username);
}

module.exports = getApi;
