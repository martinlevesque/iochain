module.exports = {


  friendlyName: 'Update payout accounts',


  description: '',


  inputs: {



  },


  exits: {

    invalidAddress: {
      statusCode: 406,
      description: 'The provided address is invalid.',
    },
    invalidPayoutThreshold: {
      statusCode: 406,
      description: 'Invalid payout'
    },
    invalidPayout: {
      statusCode: 406,
      description: 'Invalid payout - general'
    }

  },


  fn: async function (inputs, exits) {
    for (const payAccount of this.req.body.payoutAccounts) {
      try {
        sails.log.info('upd pay account ', payAccount.id);

        await PayoutAccount.pupdate( { id: payAccount.id }, {
          address: payAccount.address,
          payoutThreshold: payAccount.payoutThreshold,
          type: payAccount.type
        });

      } catch(err) {
        let thrownErr = 'invalidPayout';

        if (String(err).indexOf('payoutThreshold') >= 0) {
          thrownErr = 'invalidPayoutThreshold';
        }

        if (String(err).indexOf('Invalid address') >= 0) {
          thrownErr = 'invalidAddress';
        }

        throw thrownErr;
      }
    }

    return exits.success();
  }
};
