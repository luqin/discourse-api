import 'es6-promise';
import 'whatwg-fetch';
import Discourse from '../Discourse';
import config from './config';

let api = new Discourse(config.url, config.api.key, config.api.username);

module.exports = api;
