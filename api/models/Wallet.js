/**
 * Wallet.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Crypto = require('../lib/crypto');
const moment = require('moment');
const blockchain = require('../lib/blockchain');
const Base = require('./Base');

module.exports = _.merge(Base('Wallet'), {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    type: {
      type: 'string',
      required: true,
      isIn: ['btc']
    },

    status: {
      type: 'string',
      required: true,
      isIn: [
        'created',      // initialized, no received payment yet
        'active',       // at least one payment received
        'payment_sent', // sent, waiting approval
        'archived'
      ]
    },

    public: {
      type: 'string',
      required: true,
      unique: true
    },

    private: {
      type: 'string',
      required: true
    },

    params: {
      type: 'json'
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    merchant: {
      model: 'user'
    },

    application: {
      model: 'application'
    },

    /*
    transactions: {
      collection: 'transaction',
      via: 'wallet'
    },
    */


  },

  beforeCreate(values, cb) {
    Crypto.encrypt(values.private).then((encrypted) => {
      values.private = encrypted;
      cb();
    }).catch((err) => {
      console.log(err);
      cb(err);
    });
  },

  expiresAt: function(wallet) {
    return moment(wallet.createdAt).add(1, 'hours').toDate();
  },

  addressInfo: async function(wallet) {
    return await blockchain[wallet.type].addressInfo(wallet.public);
  },

  // in human/BTC
  currentBalance: async function (wallet) {
    try {
      return await blockchain[wallet.type].balanceOf(wallet.public);
    } catch(err) {
      sails.log.error(err);
    }
  },

  reachingPayout: async function(wallet) {
    try {
      const balance = await this.currentBalance(wallet);

      if ( ! balance || balance <= 0) {
        return {
          reachingPayout: false,
          balance: undefined
        };
      }

      const payoutAccount = await PayoutAccount.findOne({ user: wallet.merchant, type: wallet.type });

      if ( ! payoutAccount) {
        return {
          reachingPayout: false,
          balance: undefined
        };
      }

      return {
        reachingPayout: balance >= payoutAccount.payoutThreshold,
        balance: balance
      };
    } catch(err) {
      sails.log.error(err);
      return {
        reachingPayout: false,
        balance: undefined
      };
    }
  },

  type2Human: function(wallet) {
    return wallet.type.toUpperCase();
  },

  makePayout: async function(wallet) {
    const decryptedPrivate = await Crypto.decrypt(wallet.private);

    const payoutAccount = await PayoutAccount.findOne({ user: wallet.merchant, type: wallet.type });

    // from human to satoshi
    const balanceHuman = await this.currentBalance(wallet);
    let balance = blockchain[wallet.type].humanValueToOrig(balanceHuman);

    const feePerByte = await blockchain[wallet.type].getFeeRatePerByte();
    const fees = feePerByte * blockchain[wallet.type].approximateTransactionSizeInBytes();
    let amount2Send = blockchain[wallet.type].calculateFinalPriceAmount(balance, fees);

    const infoTx = await blockchain[wallet.type].makeTx(wallet.public, decryptedPrivate, payoutAccount.address, amount2Send);

    infoTx.fees = fees;
    infoTx.feesPerByte = feePerByte;

    return infoTx;
  }

});
