const expect = require('expect.js');
const paypalLib = require('../../../../../api/lib/payment/paypal');
global.sails = require('sails');

describe('Paypal', () => {

  beforeEach(() => {
  });

  describe('parse', () => {
    it('success basic', () => {
      const result = paypalLib.parse(require('./fixtures/successBasicPaypal.js'));
      expect(result.amount).to.equal(0.24999999999999997);
      expect(result.user_id).to.equal('5abaf15e9ab74100161c8ec2');
      expect(result.status).to.equal('Completed');
    });
  });

  describe('isCompleted', () => {
    it('success basic', () => {
      const result = paypalLib.parse(require('./fixtures/successBasicPaypal.js'));
      expect(paypalLib.isCompleted(result)).to.equal(true);
    });
  });


});
