/**
 * NotificationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */



module.exports = {

  list: async function(req, res) {
    const notifications = await Notification.find({  }).sort('createdAt DESC').limit(100);

    const fields = ['id', 'status', 'type', 'subType'];

    res.view('pages/superAdmin/notification/list', { list: notifications, fields });
  },

  view: async function(req, res) {
    const obj = await Notification.findOne( req.query );
    res.view('pages/superAdmin/raw-obj', { obj });
  }


};
