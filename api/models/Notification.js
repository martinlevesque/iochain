/**
 * Notification.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const Base = require('./Base');
const request = require('request');

module.exports = _.merge(Base('Notification'), {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    type: {
      type: 'string',
      isIn: ['transaction'],
      required: true
    },

    subType: {
      type: 'string',
      isIn: ['on_unconfirmed_payment', 'on_confirmed_payment'],
      required: true
    },

    status: {
      type: 'string',
      isIn: ['init', 'failed', 'finished'],
      required: true
    },

    refId: {
      type: 'ref',
      columnType: 'objectid'
    },

    emailSent: {
      type: 'boolean',
      defaultsTo: false
    },

    callbackDone: {
      type: 'boolean',
      defaultsTo: false
    },

    callbackResponse: { type: 'json' }

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝


  },

  active: async function() {
    return await Notification.find({
      status: ['init', 'failed']
    });
  },

  makeTransactionCallback: function(notification, callbackUrl, transaction, invoice) {
    return new Promise((resolve, reject) => {
      Transaction.value2USD(transaction).then((usdAmount) => {
        request.post({
          url:     callbackUrl,
          form:    {
            hash: transaction.hash,
            id: transaction.id,
            type: transaction.type,
            status: transaction.status,
            amount: transaction.value,
            usd_amount: usdAmount,
            pretty_amount: transaction.pretty_value,
            details: transaction.details,
            query_params: invoice.params
          }
        }, (error, response, body) => {
          if (error || response.statusCode !== 200) {
            reject(error);
          } else {
            resolve(body);
          }
        });
      }).catch((err) => {
        sails.log.error(err);
        reject(err);
      });
    });
  },

  processTransactionNotification: async function(notification) {
    const transaction = await Transaction.findOne({ id: notification.refId }).populate('invoice');
    const invoice = await Invoice.findOne({ id: transaction.invoice.id }).populate('merchant').populate('application');

    const callbackUrl = invoice.application.callbackUrl;
    let emailTo = null;

    try {
      if (invoice.merchant.notifications[notification.subType].active) {
        emailTo = invoice.merchant.notifications[notification.subType].notify_to;
      }
    } catch(err) {
      sails.log.error(err);
    }

    let errorsOccured = false;

    if (callbackUrl && ! notification.callbackDone) {

      let result = {};

      try {
        result = await this.makeTransactionCallback(notification, callbackUrl, transaction, invoice);
        await Notification.pupdate({ id: notification.id },
          {
            callbackDone: true,
            callbackResponse: { content: result } }
        );
      } catch(err) {
        sails.log.error(err);
        errorsOccured = true;
      }
    }

    if (emailTo && ! notification.emailSent) {
      try {
        await sails.helpers.sendTemplateEmail.with({
          to: emailTo,
          subject: 'ioChain Transaction Update',
          template: 'merchant-transaction-update',
          templateData: {
            transaction,
            invoice,
            merchant: invoice.merchant
          }
        });

        await Notification.pupdate({ id: notification.id }, { emailSent: true });
      } catch(err) {
        sails.log.error(err);
        errorsOccured = true;
      }
    }

    if ( ! errorsOccured) {
      await Notification.pupdate({ id: notification.id }, { status: 'finished' });
    }
  },

  process: async function(notification) {
    switch(notification.type) {
      case 'transaction':
        await this.processTransactionNotification(notification);
        break;
    }
  }

});
