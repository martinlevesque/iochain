const Cryptocurrency = require('../../lib/blockchain/cryptocurrency');

/*
function generateWallet(currency) {
  const type = currency.toLowerCase();
  const modCryptoCur = require(`../../lib/blockchain/${type}`);

  const wallet = modCryptoCur.generateWallet();
  wallet.type = type;

  return wallet;
}
*/

module.exports = {

  friendlyName: 'Invoice!',

  description: 'Display "Account Overview" page.',

  exits: {

    success: {
      viewTemplatePath: 'pages/transaction/invoice',
    }

  },

  fn: async function (inputs, exits) {
    const [ userId, appId ] = this.req.params.merchantId.split('-');
    const user = await User.findOne({ id: userId });
    const app = await Application.findOne({ id: appId });

    console.log('app = ');
    console.log(app);

    if ( ! user || ! app) {
      return exits.success({ app });
    }

    const originalParams = Object.assign({}, this.req.params, this.req.query);

    const params = Object.assign({}, originalParams);
    params.user = { id: user.id };

    params.totalDue = await Cryptocurrency.convert(params.currency, params.amount, 'BTC');

    const payoutAccount = await User.payoutAccount(user.id, 'btc');

    if ( ! payoutAccount || ! payoutAccount.address) {
      this.req.addFlash('danger', 'There is no payout account address set up');
    }

    params.publicKey = payoutAccount ? payoutAccount.address : '';
    params.status = 'active';
    params.app = app;
    params.sourceAddress = null;
    params.params = originalParams;
    console.log('params ?');
    console.log(params);

    exits.success(params);
  }

};
