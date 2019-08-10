/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */



module.exports = {

  list: async function(req, res) {
    const list = await User.find({  }).sort('createdAt DESC').limit(100);

    const fields = ['id', 'emailAddress', 'newsletter', 'balance', 'activePlan'];

    res.view('pages/superAdmin/user/list', { list, fields });
  },

  view: async function(req, res) {
    const obj = await User.findOne( req.query ).populate('applications');
    delete obj.password;

    res.view('pages/superAdmin/raw-obj', { obj });
  }

};
