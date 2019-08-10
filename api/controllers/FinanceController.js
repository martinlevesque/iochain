/**
 * FinanceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const roundTo = require('round-to');

if ( ! process.env.ioChainBaseReceivePaymentUrl) {
  throw new Error('process.env.ioChainBaseReceivePaymentUrl missing');
}

module.exports = {

  'make-a-payment': async function(req, res) {

    res.view('pages/finance/make-a-payment', {
      ioChainBaseReceivePaymentUrl: process.env.ioChainBaseReceivePaymentUrl,
      menu: 'finance',
      me: req.me
    });

  },

  'my-finance': async function(req, res) {

    const orders = await Order.find( { user: req.me.id } );

    res.view('pages/finance/my-finance', {
      me: req.me,
      orders,
      menu: 'finance',
      roundTo
    });
  },

  view: async function(req, res) {
    const order = await Order.findOne( { id: req.params.id, user: req.me.id } );

    res.view('pages/finance/view', {
      me: req.me,
      order,
      menu: 'finance',
      roundTo
    });
  },

  activate: async function(req, res) {

    try {
      await User.pupdate({ id: req.me.id }, { activePlan: req.query.plan });
      req.addFlash('success', 'Successfully activated the plan.');
    } catch(err) {
      sails.log.error(err);
      req.addFlash('danger', 'There was an issue changing the plan.');
    }

    res.redirect('/plans');
  }

};
