
module.exports.cron = {


  processNotifications: {
    schedule: '0 */10 * * * *',
    //schedule: '0 */1 * * * *',
    onTick: require('../crons/5-processNotifications')
  },


  checkTransactionFromClient: {
    schedule: '30 */5 * * * *',
    // schedule: '30 */1 * * * *',
    onTick: require('../crons/1-checkTransactionFromClient')
  },

  spentCreditsActiveAccounts: {
    schedule: '10 */1 * * * *',
    onTick: require('../crons/3-spentCreditsActiveAccounts')
  }

};
