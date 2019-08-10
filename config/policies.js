/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  '*': 'is-logged-in',
  'superAdmin/*': 'is-super-admin',

  // Bypass the `is-logged-in` policy for:
  'entrance/*': true,
  'transaction/invoice': true,
  'publicInvoice/*': true,
  'global/*': true,
  'doc/*': true,
  'receiveOrder/*': true,
  'address/*': true,
  'account/logout': true,
  'view-homepage-or-redirect': true,
  'deliver-contact-form-message': true,

};
