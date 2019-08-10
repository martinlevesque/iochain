
/**
 * GlobalUpdateController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

let priceBTC = '';
/*
setInterval(async () => {
  try {
    let lastVal = await Cryptocurrency.getTickerBTC();
    let newPrice = lastVal.toFixed(2);

    if (priceBTC !== newPrice) {
      sails.sockets.broadcast('pricesUpdate', 'pricesUpdate', getStats2Send());
      priceBTC = newPrice;
    }
  } catch(err) {
    sails.log.error(err);
  }

}, 30000);
*/

function getStats2Send() {
  return { btc2Usd: priceBTC };
}

module.exports = {

  listenPrices: function(req, res) {
    sails.sockets.join(req.socket, 'pricesUpdate', () => {
    });

    res.json(getStats2Send());
  },

  pki: function(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send('B94A0BD7A3EC9948F0CBA963955C89ACEE83C343AC20FA9F8C738FA621BE88EB comodoca.com 5ab65f1279e8f');
  },

  hasActiveBatchJob: async function(req, res) {
    const isRunning = false;
    const code = isRunning ? 500 : 200;

    res.status(code);
    res.json({
      result: isRunning
    });
  }

};
