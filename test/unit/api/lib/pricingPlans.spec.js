const expect = require('expect.js');
const pricingPlans = require('../../../../api/lib/pricingPlans');
global.sails = require('sails');

describe('Pricing Plans', () => {

  beforeEach(() => {
  });

  describe('plans', () => {
    it('first sandbox', () => {
      expect(pricingPlans.plans[0].id).to.equal('sandbox');
    });
  });

  describe('closestPlanOf', () => {
    it('sandbox', () => {
      expect(pricingPlans.closestPlanOf(0.0).id).to.equal('sandbox');
      expect(pricingPlans.closestPlanOf(0.0).pricePerMonth).to.equal(0.0);
    });
  });

  describe('closestPlanOf', () => {
    it('basic', () => {
      expect(pricingPlans.closestPlanOf(0.26).id).to.equal('basic');
    });

    it('basic not so close', () => {
      expect(pricingPlans.closestPlanOf(0.35).id).to.equal('basic');
    });

    it('standard', () => {
      expect(pricingPlans.closestPlanOf(2.00).id).to.equal('standard');
    });

    it('standard not so close', () => {
      expect(pricingPlans.closestPlanOf(2.35).id).to.equal('standard');
    });

    it('large price', () => {
      expect(pricingPlans.closestPlanOf(10000).id).to.equal('pro');
    });
  });

  describe('costPerMinute', () => {
    it('basic', () => {
      expect(pricingPlans.costPerMinute('basic')).to.equal(0.000005600358422939068);
    });

    it('standard', () => {
      expect(pricingPlans.costPerMinute('standard')).to.equal(0.000044802867383512545);
    });

    it('pro', () => {
      expect(pricingPlans.costPerMinute('pro')).to.equal(0.0003360215053763441);
    });
  });

});
