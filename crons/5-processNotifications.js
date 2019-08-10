const cronUtil = require('./util');

const name = 'processNotifications';

module.exports = async function () {
  cronUtil.initBatchJob(name);

  try {
    const result = {};
    cronUtil.logEvent(name, `processNotifications`);

    const notifications = await Notification.active();
    result.nb2Process = notifications.length;

    for (const notification of notifications) {
      try {
        cronUtil.logEvent(name, `  Checking notification ${notification.id}`);
        await Notification.process(notification);
      } catch(err) {
        cronUtil.logEvent(name, `  issue processing notification ${notification.id}`);
        sails.log.error(err);
      }
    }

    cronUtil.finishBatchJob(name);
  } catch(err) {
    cronUtil.logEvent(name, `process issue: ${err}`);
  }
};
