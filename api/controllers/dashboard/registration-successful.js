module.exports = {


  friendlyName: 'First login',


  description: 'Registered.',


  exits: {

    success: {
      viewTemplatePath: 'pages/dashboard/registration_successful',
      description: 'Display the welcome page for authenticated users.'
    },

  },


  fn: async function (inputs, exits) {

    return exits.success();

  }


};
