const BlockchainExplorer = require('blockchain.info/blockexplorer');
const BlockchainExchange = require('blockchain.info/exchange');
const BlockchainPushTx = require('blockchain.info/pushtx');
const BlockchainStatistics = require('blockchain.info/statistics');
const request = require('request');

module.exports = class Cryptocurrency {
  static async getAddress(addr, opts = {}) {
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    return await BlockchainExplorer.getAddress(addr, opts);
  }

  static async pushTx(tx, opts = {}) {
    return await BlockchainPushTx.pushtx(tx, opts);
  }

  static async getStats(opts = {}) {
    return await BlockchainStatistics.get(opts);
  }

  static getReq(url) {
    sails.log.debug(`Crypto Request: ${url}`);

    return new Promise((resolve) => {
      request(url, (error, response, body) => {
        if (error || response.statusCode !== 200) {
          sails.log.error(error);
          resolve({});
        } else {
          const obj = JSON.parse(body);
          resolve(obj);
        }
      });
    });
  }

  static blockchainReq(path) {
    const url = `https://blockchain.info${path}`;

    return Cryptocurrency.getReq(url);
  }

  static async getTickerBTC() {
    let ticker = await Cryptocurrency.blockchainReq('/fr/ticker');
    return ticker.USD.last;
  }

  static calculateFinalPriceAmount(amountToTransfer, fees) {
    if ( ! amountToTransfer) {
      throw new Error('no amount provided');
    }

    if ( ! fees) {
      throw new Error('no fees provided');
    }

    const final = amountToTransfer - fees;

    if (final <= 0) {
      throw new Error('final amount should be >= 0');
    }

    return final;
  }

  // from currency to toCurrency
  static async convert(currency, amount, toCurrency) {
    if (toCurrency === 'BTC' && currency === 'USD') {
      return await BlockchainExchange.toBTC(amount, currency);
    }
    else if (toCurrency === 'USD' && currency === 'BTC') {
      return await BlockchainExchange.fromBTC(amount, toCurrency);
    }

    throw new Error(`Currency ${toCurrency} not supported`);
  }
};
