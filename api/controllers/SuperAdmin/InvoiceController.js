/**
 * Controller
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */



module.exports = {

  list: async function(req, res) {
    const list = await Invoice.find({  }).sort('createdAt DESC').limit(100);

    const fields = ['id', 'type', 'status', 'paidByAddress', 'createdAt', 'updatedAt'];

    res.view('pages/superAdmin/invoice/list', { list, fields });
  },

  view: async function(req, res) {
    const obj = await Invoice.findOne( req.query );
    res.view('pages/superAdmin/raw-obj', { obj });
  },

  edit: async function(req, res) {
    const obj = await Invoice.findOne( req.query );
    res.view('pages/superAdmin/raw-edit-obj', { obj, action: `/superAdmin/invoice/update?id=${obj.id}` });
  },

  update: async function(req, res) { // TODO refactor to reuse
    const obj = await Invoice.findOne( req.query );

    try {
      let newObj = Object.assign({}, JSON.parse(req.body.content));
      delete newObj.id;
      delete newObj.createdAt;
      delete newObj.updatedAt;
      await Invoice.pupdate({ id: obj.id}, newObj);
    } catch(err) {
      sails.log.error(err);
      req.addFlash('danger', 'There was an issue saving the object');
    }

    res.redirect(`/superAdmin/invoice/edit?id=${obj.id}`);
  }

};
