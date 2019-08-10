
/**
 * DocController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {

  index: function(req, res) {
    res.view('pages/doc/index', {
      title: 'Documentation'
    });
  },

  callbackResponseFormat: function(req, res) {
    res.view('pages/doc/callbackResponseFormat', {
      title: 'Callback Response Format'
    });
  }

};
