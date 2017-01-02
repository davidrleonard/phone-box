
/*
 * Helps with parsing environment variables (i.e. dev environment settings, secrets
 * that shouldn't be checked into git, etc.)
 *
 * It's recommended that you require this module as early as possible in your
 * application's main file to ensure all values are set.
 */

'use strict';

/**
 * The `NODE_ENV` environment variable.  If none is set, defaults to 'dev'.
 * Usually 'production' on production systems like Heroku.
 *
 * @constant
 * @type {String}
 */
const ENV = process.env.NODE_ENV || 'dev';

/**
 * If `NODE_ENV` environment variable is set to 'dev', attempts to load secrets
 * from `.env` file in root of project and assign all found variables to
 * process.env.
 *
 * @example
 *
 *     require('./env');
 *     var foo = process.env.FOO; // if .env file includes 'FOO=bar', the variable foo will be set to 'bar'
 *
 * @exports
 */
exports = module.exports = (function(){
  if (ENV === 'dev') {
    console.log('Dev environment detected. Attempting to load `.env` file from project root.')
    require('dotenv').config();
  }
})();
