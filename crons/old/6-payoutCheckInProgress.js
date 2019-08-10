
const blockchain = require('../api/lib/blockchain');
const cronUtil = require('./util');

module.exports = async function () {
  let batchId = await cronUtil.initBatchJob('payoutCheckInProgress');

  try {
    sails.log.info(new Date(), 'payoutCheckInProgress');

    let transactions = await Transaction.find({ status: 'unconfirmed', type: 'payout' })
      .populate('wallet');

    for (const transaction of transactions) {
      let txFull = null;

      try {
        txFull = await blockchain[transaction.wallet.type].tx(transaction.hash);
      }
      catch(err) {
        sails.log.error(err);

        // if it fails, it perhaps means we should try to resend it
        await Wallet.makePayout(transaction.wallet);
      }

      // is it now confirmed?
      if (txFull && txFull.status === 'confirmed') {
        await Transaction.pupdate({ id: transaction.id }, { status: 'confirmed' });
        await Wallet.pupdate({ id: transaction.wallet.id }, { status: 'payment_sent' });

        // schedule a notification: CONFIRMED
        await cronUtil.scheduleNotification({
          type: 'transaction',
          subType: 'on_confirmed_payout',
          status: 'init',
          refId: transaction.id
        });
      }
    }

    await cronUtil.finishBatchJob(batchId, {});
  } catch(err) {
    sails.log.error(err);
    await cronUtil.failBatchJob(batchId, err);
  }
};
