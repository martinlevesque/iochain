// const Bitcoin = require('../../lib/blockchain/bitcoin');
const Cryptocurrency = require('../../lib/blockchain/cryptocurrency');

module.exports = {


  friendlyName: 'Update password',


  description: 'Update the password for the logged-in user.',


  inputs: {


  },


  fn: async function (inputs, exits) {

    console.log('hi');
    // const wallet = Bitcoin.generateWallet();
    let result = await Cryptocurrency.getAddress('12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX');
    console.log('resullltt = ');
    console.log(result);

    return exits.success(result);

  }


};
