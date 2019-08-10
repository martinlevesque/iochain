/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * https://sailsjs.com/docs/concepts/logging
 */

const winston = require('winston');
const util = require('util');
const traceify = require('traceify-node');

const customLogger = new winston.Logger();

// A console transport logging debug and above.
// customLogger.add(winston.transports.Console, {
//  level: 'debug',
//  colorize: true
//});

const TraceifyLogger = winston.transports.CustomLogger = function (options) {
  options = options || {};
  //
  // Name this logger
  //
  this.name = 'traceifyLogger';

  //
  // Set the level from your options
  //
  this.level = options.level || 'debug';

  //
  // Configure your storage backing as you see fit
  //
};

//
// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
//
util.inherits(TraceifyLogger, winston.Transport);

TraceifyLogger.prototype.log = function (level, msg, meta, callback) {
  //
  // Store this message and metadata, maybe use some custom logic
  // then callback indicating success.
  traceify({ token: process.env.TRACEIFY_ADMIN_TOKEN, site_name: 'iochain.co' }).log(level, msg).then(() => {

  }).catch((err) => {
    console.log(err);
  });

  //
  callback(null, true);
};

customLogger.add(TraceifyLogger);

module.exports.log = {

  /***************************************************************************
  *                                                                          *
  * Valid `level` configs: i.e. the minimum log level to capture with        *
  * sails.log.*()                                                            *
  *                                                                          *
  * The order of precedence for log levels from lowest to highest is:        *
  * silly, verbose, info, debug, warn, error                                 *
  *                                                                          *
  * You may also set the level to "silent" to suppress all logs.             *
  *                                                                          *
  ***************************************************************************/

  // level: 'info'
  custom: customLogger,
  level: 'silly',

  // Disable captain's log so it doesn't prefix or stringify our meta data.
  inspect: false

};
