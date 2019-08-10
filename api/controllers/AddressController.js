/**
 * AddressController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const blockchain = require('../lib/blockchain');


module.exports = {

  info: async function(req, res) {

    if ( ! req.params.publicKey) {
      return res.badRequest();
    }

    const wallet = await Wallet.findOne({ public: req.params.publicKey });

    if ( ! wallet) {
      return res.notFound();
    }

    res.json({
      public: wallet.public,
      status: wallet.status
    });
  },

  isValid: async function(req, res) {

    try {
      const valid = blockchain[req.query.type].addressValid(req.query.addr);

      res.json({
        result: valid
      });
    } catch(err) {

      sails.log.error(err);

      res.json({
        result: false
      });
    }


  }

};
