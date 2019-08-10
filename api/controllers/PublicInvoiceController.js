/**
 * PublicInvoiceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  create: async function(req, res) {

    try {
      const info = Object.assign({}, req.body, { status: 'init' });
      await Invoice.pcreate(info);
      res.json({ });
    } catch(err) {
      sails.log.error(err);
      res.json({ });
    }
  }

};
