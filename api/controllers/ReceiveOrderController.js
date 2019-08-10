/**
 * ReceiveOrderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const paypalLib = require('../lib/payment/paypal');
const pricingPlans = require('../lib/pricingPlans');

async function recordOrder(orderOpts, userId, amountUsd) {
  const user = await User.findOne({ id: userId});

  sails.log.info('user = ');
  sails.log.info(user);

  // create order
  const order = await Order.pcreate(orderOpts);

  sails.log.info('order created = ');
  sails.log.info(order);

  let newPlan = user.activePlan;

  if (user.activePlan === 'sandbox') {
    newPlan = pricingPlans.closestPlanOf(amountUsd).id;
  }

  sails.log.info('new plan = ');
  sails.log.info(newPlan);

  let newBalance = parseFloat(user.balance) + parseFloat(amountUsd);

  sails.log.info('new balance = ');
  sails.log.info(newBalance);

  // add amount to user and plan
  await User.pupdate({ id: user.id }, {
    balance: newBalance,
    activePlan: newPlan
  });
}

module.exports = {

  paypal: async function(req, res) {

    sails.log.info(JSON.stringify(req.body, null, 4));
    const parsedOrder = paypalLib.parse(req.body);

    if (paypalLib.isCompleted(parsedOrder)) {
      sails.log.info('order completed');

      const orderOpts = {
        type: 'paypal',
        amount: parsedOrder.amount,
        usd_amount: parsedOrder.amount,
        content: {
          response: parsedOrder.content
        },
        user: parsedOrder.user_id
      };

      sails.log.info('Order to record');
      sails.log.info(JSON.stringify(orderOpts, null, 4));

      await recordOrder(orderOpts, parsedOrder.user_id, parsedOrder.amount);
    } else {
      sails.log.info('order NOT completed');
    }

    res.json({});
  },

  /*
  req.body.hash
  req.body.id
  req.body.type
  req.body.status
  req.body.amount
  req.body.usd_amount
  req.body.pretty_amount
  req.body.details
  req.body.query_params // userId
  */
  iochain: async function(req, res) {
    sails.log.info(`receiveOrder::iochain - body = ${JSON.stringify(req.body, null, 4)}`);

    if (req.body.status && req.body.status === 'confirmed') {
      req.body.query_params = req.body.query_params || {};
      const userId = req.body.query_params.userId;

      sails.log.info(`receiveOrder::iochain - user id = ${userId}`);

      if ( ! userId) {
        return res.status(500).json({
          result: 'user id missing'
        });
      }

      const amountUsd = req.body.usd_amount; //await Cryptocurrency.convert('BTC', req.body.amount, 'USD');

      const orderOpts = {
        type: 'iochain',
        amount: req.body.amount,
        usd_amount: amountUsd,
        content: {
          response: req.body
        },
        user: userId
      };

      sails.log.info(`receiveOrder::iochain - order opts = ${JSON.stringify(orderOpts, null, 4)}`);

      await recordOrder(orderOpts, userId, amountUsd);

      res.json({ result: 'done' });
    } else {
      res.json({
        result: 'not confirmed'
      });
    }
  }

};
