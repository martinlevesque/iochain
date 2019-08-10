const moment = require('moment');
const cronUtil = require('./util');

module.exports = async function () {
  let batchId = await cronUtil.initBatchJob('checkPayouts');

  try {
    sails.log.info(new Date(), 'checkShouldArchiveWallet');

    await Wallet.pupdate({
      createdAt: { '<': moment().subtract(1, 'hours').toDate() },
      status: 'created'
    }, {
      status: 'archived'
    });

    await cronUtil.finishBatchJob(batchId, {});
  } catch(err) {
    sails.log.error('checkShouldArchiveWallet issue');
    sails.log.error(err);
    await cronUtil.failBatchJob(batchId, err);
  }
};
