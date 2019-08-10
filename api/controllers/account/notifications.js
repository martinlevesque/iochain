module.exports = {


  friendlyName: 'Notification settings',


  description: 'Display notification settings',


  exits: {

    success: {
      viewTemplatePath: 'pages/account/notifications',
    }

  },


  fn: async function (inputs, exits) {

    const availableNotifications = [
      { id: 'on_unconfirmed_payment', label: 'On unconfirmed payment' },
      { id: 'on_confirmed_payment', label: 'On confirmed payment' }
    ];

    if ( ! this.req.me.notifications) {
      this.req.me.notifications = {};
    }

    for (let notif of availableNotifications) {
      if (this.req.me.notifications[notif.id] === undefined) {
        this.req.me.notifications[notif.id] = {};
      }

      if ( ! this.req.me.notifications[notif.id].notify_to) {
        this.req.me.notifications[notif.id].notify_to = this.req.me.emailAddress;
      }
    }

    return exits.success({
      notifications: this.req.me.notifications,
      availableNotifications,
      menu: 'settings'
    });
  }


};
