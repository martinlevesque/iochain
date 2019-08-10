/**
 * TransactionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  list: async function(req, res) {
    const invoiceIds = (await Invoice.find( { merchant: req.me.id })).map(i => i.id);
    const transactions = await Transaction.find({ invoice: invoiceIds }).populate('invoice');

    for (const transaction of transactions) {
      if (transaction.invoice) {
        try {
          transaction.invoice.application = await Application.findOne({ id: transaction.invoice.application });
        } catch(err) {
          console.log(err);
          transaction.invoice.application = {};
        }
      }
    }

    res.view('pages/transaction/list', {
      transactions,
      menu: 'my-apps',
      menuItem: 'transactions'
    });
  },

  view: async function(req, res) {
    const transaction = await Transaction.findOne({ id: req.params.transactionId }).populate('invoice');

    if ( ! transaction) {
      return res.notFound();
    }

    res.view('pages/transaction/view', {
      transaction,
      menu: 'my-apps',
      menuItem: 'transactions'
    });
  }

};
