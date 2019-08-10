/**
 * Transaction.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const Base = require('./Base');
const blockchain = require('../lib/blockchain');

module.exports = _.merge(Base('Transaction'), {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    status: {
      type: 'string',
      isIn: ['unconfirmed', 'confirmed'],
      required: true
    },

    type: {
      type: 'string',
      isIn: ['from_client', 'payout'],
      required: true
    },

    currency_type: {
      type: 'string',
      required: true,
      isIn: ['btc']
    },

    value: {
      type: 'number',
      required: true
    },

    pretty_value: {
      type: 'number',
      required: true
    },

    hash: {
      type: 'string',
      unique: true,
      required: true
    },

    details: { type: 'json' }, // can have "fees" and "feesPerByte"

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    invoice: {
      model: 'invoice'
    }

  },

  value2Human: function(transaction) {
    return `${transaction.pretty_value} ${Invoice.type2Human(transaction.invoice)}`;
  },

  value2USD: async function(transaction) {
    return await blockchain[transaction.currency_type].toUSD(transaction.value);
  },


  type2Human: function(transaction) {
    switch(transaction.type) {
      case 'from_client':
        return 'From client';
      case 'payout':
        return 'Payout';
    }

    return 'N/A';
  }

});
