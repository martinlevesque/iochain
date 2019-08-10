
const pricingPlans = require('../../lib/pricingPlans');

module.exports = {


  friendlyName: 'Plans',


  description: 'Display the available plans',


  exits: {

    success: {
      viewTemplatePath: 'pages/plans',
    }

  },


  fn: async function (inputs, exits) {

    return exits.success({
      title: 'Our Pricing Plans',
      plans: pricingPlans.plans,
      me: this.req.me,
      menu: 'finance'
    });
  }
};
