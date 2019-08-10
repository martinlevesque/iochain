const blockchain = require('../api/lib/blockchain');
const cronUtil = require('./util');

const name = 'checkTransactionFromClient';

async function processNewTransaction(tx, invoice, blockchainDestTx) {
  const txFull = await blockchain[invoice.type].tx(tx.hash);

  cronUtil.logEvent(name, ` process new transaction`);
  cronUtil.logEvent(name, ` txFull = ${JSON.stringify(txFull, null, 4)}`);

  // NEW RECEIVING TX !!!
  const transaction = await Transaction.pcreate({
    status: txFull.status,
    type: 'from_client',
    hash: tx.hash,
    invoice: invoice.id,
    currency_type: invoice.type,
    details: txFull,
    value: blockchainDestTx.value,
    pretty_value: blockchain[invoice.type].origValueToHuman(blockchainDestTx.value)
  });

  cronUtil.logEvent(name, ` transaction created.. ${JSON.stringify(transaction, null, 4)}`);

  // move to active
  if (invoice.status === 'init') {
    cronUtil.logEvent(name, ` invoice is init status, updating to active`);

    await Invoice.pupdate({ id: invoice.id }, {
      status: 'active'
    });
  }

  const subTypeNotification = txFull.status === 'confirmed' ? 'on_confirmed_payment' : 'on_unconfirmed_payment';

  cronUtil.logEvent(name, ` subTypeNotification = ${subTypeNotification}`);
  cronUtil.logEvent(name, ` will schedule notification`);

  await cronUtil.scheduleNotification({
    type: 'transaction',
    subType: subTypeNotification,
    status: 'init',
    refId: transaction.id
  });
}

async function processExistingTransaction(iochainTx, tx, invoice) {

  cronUtil.logEvent(name, ` processExistingTransaction, status = ${iochainTx.status}`);

  // The transaction already exists in our system
  if (iochainTx.status === 'unconfirmed') {
    // need to confirm, check again the blockchain
    const txFull = await blockchain[invoice.type].tx(tx.hash);

    cronUtil.logEvent(name, ` txFull = ${JSON.stringify(txFull, null, 4)}`);

    // is it now confirmed?
    if (txFull && txFull.status === 'confirmed') {
      cronUtil.logEvent(name, ` NOW CONFIRMED`);
      // Confirm the transaction:
      await Transaction.pupdate({ id: iochainTx.id }, { status: 'confirmed' });

      cronUtil.logEvent(name, ` closing the invoice`);
      // close the invoice
      await Invoice.pupdate({ id: invoice.id }, {
        status: 'archived'
      });

      cronUtil.logEvent(name, ` scheduling notification`);

      // schedule a notification: CONFIRMED
      await cronUtil.scheduleNotification({
        type: 'transaction',
        subType: 'on_confirmed_payment',
        status: 'init',
        refId: iochainTx.id
      });
    }
  }
  else if (iochainTx.status === 'confirmed') {
    cronUtil.logEvent(name, ` iochain tx was confirmed, closing invoice ${invoice.id}`);

    // close the invoice
    await Invoice.pupdate({ id: invoice.id }, {
      status: 'archived'
    });
  }
}

module.exports = async function () {
  cronUtil.initBatchJob(name);

  try {
    cronUtil.logEvent(name, 'Starting invoices check');

    const invoices = await Invoice.find({ status: ['init', 'active'] })
      .populate('merchant').populate('application');

    for (const invoice of invoices) {
      try {
        cronUtil.logEvent(name, `checking invoice ${invoice.id}`);
        const payoutAccount = await User.payoutAccount(invoice.merchant.id, invoice.type);

        if (payoutAccount && payoutAccount.address) {
          cronUtil.logEvent(name, `   has payout account`);
          const potentialTxs = await blockchain[invoice.type].getTxsFromSourceToDestination(invoice.paidByAddress, payoutAccount.address);


          for (const tx of potentialTxs) {
            try {
              cronUtil.logEvent(name, `potential tx ${tx.tx.hash}`);
              const foundTx = await Transaction.findOne({ hash: tx.tx.hash });

              if ( ! foundTx) {
                cronUtil.logEvent(name, ` process new transaction`);
                await processNewTransaction(tx.tx, invoice, tx.existsDestTx);
              } else {
                cronUtil.logEvent(name, ` process existing transaction`);
                await processExistingTransaction(foundTx, tx.tx, invoice);
              }
            } catch(err) {
              sails.log.error(err);
            }
          }
        }
      } catch(err) {
        sails.log.error(err);
      }
    }

    cronUtil.finishBatchJob(name);
  } catch(err) {
    sails.log.error(err);
  }
};
