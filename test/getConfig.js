var
  fs = require('fs'),
  path = require('path'),
  config = JSON.parse(fs.readFileSync(path.normalize(__dirname + '/config.json', 'utf8')));

module.exports = config;

