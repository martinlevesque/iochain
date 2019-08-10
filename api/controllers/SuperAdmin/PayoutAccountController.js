/**
 * PayoutAccountController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */



module.exports = {

  list: async function(req, res) {
    const list = await PayoutAccount.find({  }).sort('createdAt DESC').limit(100);

    const fields = ['id', 'type', 'address', 'user'];

    res.view('pages/superAdmin/payoutAccount/list', { list, fields });
  },

  view: async function(req, res) {
    const obj = await PayoutAccount.findOne( req.query ).populate('user');

    res.view('pages/superAdmin/raw-obj', { obj });
  }

};
