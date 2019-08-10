
const plans = [
  {
    id: 'sandbox',
    title: 'Free',
    limitTransactionsPerMonth: 3,
    limitNbApps: 1,
    pricePerMonth: 0.0
  },
  {
    id: 'basic',
    title: 'Basic',
    limitTransactionsPerMonth: 10,
    limitNbApps: 10000,
    pricePerMonth: 0.25
  },
  {
    id: 'standard',
    title: 'Standard',
    limitTransactionsPerMonth: 100,
    limitNbApps: 10000,
    pricePerMonth: 2.00
  },
  {
    id: 'pro',
    title: 'Pro',
    limitTransactionsPerMonth: 1000,
    limitNbApps: 10000,
    pricePerMonth: 15.0
  },
];

function closestPlanOf(price) {
  let closest = null;
  let diffPrice = 100000;

  for (let plan of plans) {
    if (Math.abs(plan.pricePerMonth - price) < diffPrice) {
      diffPrice = Math.abs(plan.pricePerMonth - price);
      closest = plan;
    }
  }

  if ( ! closest) {
    return plans[0];
  }

  return closest;
}

function get(id) {
  return plans.find(p => p.id === id);
}

function costPerMinute(planId) {
  try {
    const plan = get(planId);

    const pricePerMonth = plan.pricePerMonth;
    const minutesPerMonth = 60 * 24 * 31.0;

    const pricePerMinute = pricePerMonth / minutesPerMonth;

    return pricePerMinute;
  } catch(err) {
    sails.log.error(err);
  }

  return 0;
}

module.exports = {
  plans,
  closestPlanOf,
  get,
  costPerMinute
};
