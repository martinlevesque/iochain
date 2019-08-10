const cronUtil = require('./util');

const name = 'spentCreditsActiveAccounts';

module.exports = async function () {
  cronUtil.initBatchJob(name);

  try {
    const merchants = await User.withActivePlan();

    for (const merchant of merchants) {
      try {
        const pPerMinute = User.pricePerMinute(merchant);

        if (pPerMinute) {
          const newBalance = merchant.balance - pPerMinute;
          cronUtil.logEvent(name, ` spending ${pPerMinute} for merchant ${merchant.id}. new balance = ${newBalance}`);

          await User.pupdate({ id: merchant.id }, { balance: newBalance });
        }
      } catch(err) {
        cronUtil.logEvent(name, ` err with ${merchant.id}: ${err}`);
        sails.log.error(err);
      }
    }

    cronUtil.finishBatchJob(name);
  } catch(err) {
    cronUtil.logEvent(name, `spentCreditsActiveAccounts issue: ${err}`);
  }
};
