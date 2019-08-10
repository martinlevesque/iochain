/**
 * ApplicationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  list: async function(req, res) {
    const applications = await Application.find({ user: req.me.id, archived: false });

    res.view('pages/application/list', {
      applications,
      menu: 'my-apps',
      menuItem: 'list'
    });
  },

  new: async function(req, res) {
    res.view('pages/application/form', {
      app: {},
      action: '/application/create',
      menu: 'my-apps',
      menuItem: 'list'
    });
  },

  create: async function(req, res) {
    try {
      const { name, callbackUrl } = Object.assign({}, req.body);

      await Application.pcreate({ name, callbackUrl, user: req.me.id });

      res.redirect('/application/list');
    } catch (err) {
      sails.log.error(err);
      req.addFlash('danger', 'There was an issue creating the application');
      res.redirect('/application/new');
    }
  },

  edit: async function(req, res) {
    const app = await Application.findOne({ id: req.params.id, user: req.me.id });

    if ( ! app) {
      return res.notFound();
    }

    res.view('pages/application/form', {
      app,
      action: `/application/update/${app.id}`,
      menu: 'my-apps',
      menuItem: 'list'
    });
  },

  // POST
  update: async function(req, res) {
    try {
      const { name, callbackUrl, id } = Object.assign({}, req.body);

      await Application.pupdate({ id, user: req.me.id }, { name, callbackUrl });

      res.redirect('/application/list');
    } catch (err) {
      sails.log.error(err);
      req.addFlash('danger', 'There was an issue editing the application');
      res.redirect(`/application/edit/${req.body.id}`);
    }
  },

  generatePaymentLink: async function(req, res) {
    const app = await Application.findOne({ id: req.params.id, user: req.me.id });

    if ( ! app) {
      return res.notFound();
    }

    res.view('pages/application/generate-payment-link', {
      app,
      baseInvoiceUrl: process.env.BASE_INVOICE_URL
    });
  }

};
