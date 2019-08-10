const blockchain = require('../api/lib/blockchain');
const cronUtil = require('./util');

async function processNewTransaction(tx, wallet, blockchainDestTx) {
  const txFull = await blockchain[wallet.type].tx(tx.hash);

  // NEW RECEIVING TX !!!
  const transaction = await Transaction.pcreate({
    status: txFull.status,
    type: 'from_client',
    hash: tx.hash,
    wallet: wallet.id,
    details: txFull,
    value: blockchainDestTx.value,
    pretty_value: blockchain[wallet.type].origValueToHuman(blockchainDestTx.value)
  });

  // move to active
  if (wallet.status === 'created') {
    await Wallet.pupdate({ id: wallet.id }, {
      status: 'active'
    });
  }

  const subTypeNotification = txFull.status === 'confirmed' ? 'on_confirmed_payment' : 'on_unconfirmed_payment';

  await cronUtil.scheduleNotification({
    type: 'transaction',
    subType: subTypeNotification,
    status: 'init',
    refId: transaction.id
  });
}

async function processExistingTransaction(iochainTx, tx, wallet) {
  // The transaction already exists in our system
  if (iochainTx.status === 'unconfirmed') {
    // need to confirm, check again the blockchain
    const txFull = await blockchain[wallet.type].tx(tx.hash);

    // is it now confirmed?
    if (txFull && txFull.status === 'confirmed') {
      // Confirm the transaction:
      await Transaction.pupdate({ id: iochainTx.id }, { status: 'confirmed' });

      // schedule a notification: CONFIRMED
      await cronUtil.scheduleNotification({
        type: 'transaction',
        subType: 'on_confirmed_payment',
        status: 'init',
        refId: iochainTx.id
      });
    }
  }
}

module.exports = async function () {
  let batchId = await cronUtil.initBatchJob('checkTransactionFromClient');

  try {
    sails.log.info(new Date(), 'checkTransactionFromClient');

    let wallets2Check = await Wallet.find({ status: ['created', 'active'] });

    for (let wallet of wallets2Check) {
      try {
        let addrInfo = await Wallet.addressInfo(wallet);

        for (const tx of addrInfo.txs) {
          try {
            const existsDestTx = blockchain[wallet.type].getOutTxInfoOf(tx, wallet.public);

            if (existsDestTx) {
              const foundTx = await Transaction.findOne({ wallet: wallet.id, hash: tx.hash });

              if ( ! foundTx) {
                await processNewTransaction(tx, wallet, existsDestTx);
              } else {
                await processExistingTransaction(foundTx, tx, wallet);
              }
            }
          } catch(err) {
            sails.log.error(err);
          }
        }

      } catch(err) {
        sails.log.error(err);
      }
    }

    await cronUtil.finishBatchJob(batchId, {});
  } catch(err) {
    sails.log.error(err);
    await cronUtil.failBatchJob(batchId, err);
  }
};
