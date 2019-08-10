module.exports = {


  friendlyName: 'Update notifications',


  description: '',


  inputs: {



  },


  exits: {

  },


  fn: async function (inputs, exits) {

    if (this.req.body.notifications) {
      await User.pupdate({ id: this.req.me.id}, {
        notifications: this.req.body.notifications
      });
    }

    return exits.success();
  }
};
