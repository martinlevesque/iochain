const moment = require('moment');
const cronUtil = require('./util');

module.exports = {
  // Should we delete a wallet ? We do so if 2 hours passed without transaction
  checkDestroyWallet: {
    schedule: '0 */5 * * * *',
    onTick: async function () {
      let batchId = await cronUtil.initBatchJob('checkPayouts');

      try {
        sails.log.info(new Date(), 'checkDestroyWallet');

        // destroy 2 hours old wallets which are archived
        let walletsArchived = await Wallet.find({
          createdAt: { '<': moment().subtract(2, 'hours').toDate() },
          status: 'archived'
        }).populate('transactions');

        if ( ! walletsArchived) {
          walletsArchived = [];
        }

        const walletIds2Destroy = walletsArchived
          .filter( w => ! w.transactions || w.transactions.length === 0)
          .map(w => w.id);

        if (walletIds2Destroy && walletIds2Destroy.length > 0) {
          await Wallet.pdestroy({id: walletIds2Destroy});
          sails.log.info('checkDestroyWallet: Deleted ids ', walletIds2Destroy);
        }

        await cronUtil.finishBatchJob(batchId, {});
      } catch(err) {
        sails.log.error('checkDestroyWallet issue');
        sails.log.error(err);
        await cronUtil.failBatchJob(batchId, err);
      }
    }
  }
};
