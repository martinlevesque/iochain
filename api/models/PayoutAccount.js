/**
 * PayoutAccount.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const blockchain = require('../lib/blockchain');
const Base = require('./Base');

module.exports = _.merge(Base('PayoutAccount'), {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    type: {
      type: 'string',
      required: true,
      isIn: ['btc']
    },

    address: {
      type: 'string',
      defaultsTo: ''
    },

    payoutThreshold: {
      type: 'number',
      min: 0,
      defaultsTo: 0.0
    },

    params: { type: 'json' },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    user: {
      model: 'user'
    }

  },

  prettyType: function(t) {
    switch(t) {
      case 'btc':
        return 'Bitcoin';
    }

    return '';
  },

  beforeUpdate: function(values, cb) {

    if ( ! blockchain[values.type].addressValid(values.address)) {
      throw new Error(`Invalid address: ${values.address}`);
    }

    cb();
  }

});
