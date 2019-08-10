
const NeverBounce = require('neverbounce');
const neverBounceSecret = process.env.NEVER_BOUNCE_API_KEY;

if ( ! neverBounceSecret) {
  throw new Error('Missing never bounce secret');
}

module.exports = function isEmailValid(email) {
  return new Promise((resolve => {
    // Initialize NeverBounce client
    const client = new NeverBounce({ apiKey: neverBounceSecret });

    // Verify an email
    client.single.check(email).then(
      result => {
        resolve(result.response && ['catchall', 'valid'].indexOf(result.response.result) >= 0);
      },
      err => {
        console.log(err);
        resolve(false);
      }
    );
  }));
};
