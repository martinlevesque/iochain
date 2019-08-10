
// const serializeError = require('serialize-error');

async function scheduleNotification(opts) {
  await Notification.pcreate(opts);
}

module.exports = {
  scheduleNotification,

  info: function(name, str) {
    sails.log.info(`${new Date()} ${name}: ${str}`);
  },

  error: function(name, str) {
    sails.log.error(`${new Date()} ${name}: ${str}`);
  },

  initBatchJob: function(type) {
    sails.log.info(`initializing batch job - ${type}`);
  },

  logEvent: function(type, e) {
    this.info(type, e);
  },

  finishBatchJob: function(type) {
    sails.log.info(`initializing batch job - ${type}`);
  }
};
