module.exports = {


  friendlyName: 'Payout',


  description: 'Display payout accounts.',


  exits: {

    success: {
      viewTemplatePath: 'pages/account/payout',
    }

  },


  fn: async function (inputs, exits) {

    // User.update({ id: this.req.me.id });
    // await this.req.me.populate('payoutAccounts');
    const accountTypes = ['btc'];

    const payoutAccounts = [];

    for (const accountType of accountTypes) {
      let payoutAccount = await PayoutAccount.findOne({ user: this.req.me.id, type: accountType });

      if ( ! payoutAccount) {
        payoutAccount = await PayoutAccount.pcreate({ user: this.req.me.id, type: accountType });
        //payoutAccount = await PayoutAccount.findOne({ user: this.req.me.id, type: accountType });
      }

      payoutAccount.prettyType = PayoutAccount.prettyType(payoutAccount.type);
      payoutAccounts.push(payoutAccount);
    }

    return exits.success({
      payoutAccounts,
      menu: 'settings'
    });

  }


};
