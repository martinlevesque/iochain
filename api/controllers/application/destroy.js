module.exports = {


  friendlyName: 'Destroy an application',


  description: '',


  inputs: {

    id: {
      type: 'string'
    }

  },


  fn: async function (inputs, exits) {
    await Application.pupdate({ id: inputs.id, user: this.req.me.id }, { archived: true });

    return exits.success();
  }


};
