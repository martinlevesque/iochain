
const blockchain = require('../api/lib/blockchain');
const cronUtil = require('./util');

const NB_PER_BATCH = 100;

module.exports = async function () {
  let batchId = await cronUtil.initBatchJob('checkPayouts');

  try {
    sails.log.info(new Date(), 'checkPayouts');

    const criteria = {
      status: 'active'
    };

    const nb = await Wallet.count(criteria);

    const toSkip = Math.floor(Math.random() * nb);

    let wallets = await Wallet.find(criteria).limit(NB_PER_BATCH).skip(toSkip);

    for (const wallet of wallets) {
      const { reachingPayout, balance } = await Wallet.reachingPayout(wallet);

      if (reachingPayout && balance) {
        const infoTx = await Wallet.makePayout(wallet);

        if (infoTx && infoTx.hash) {
          const transaction = await Transaction.pcreate({
            status: 'unconfirmed',
            type: 'payout',
            hash: infoTx.hash,
            wallet: wallet.id,
            details: infoTx,
            value: infoTx.output.amount, //
            pretty_value: blockchain[wallet.type].origValueToHuman(infoTx.output.amount)
          });

          // mark wallet as payment sent
          await Wallet.pupdate({ id: wallet.id }, { status: 'payment_sent' });

          await cronUtil.scheduleNotification({
            type: 'transaction',
            subType: 'on_unconfirmed_payout',
            status: 'init',
            refId: transaction.id
          });
        }
      }
    }

    await cronUtil.finishBatchJob(batchId, {});
  } catch(err) {
    sails.log.error(err);
    await cronUtil.failBatchJob(batchId, err);
  }
};
