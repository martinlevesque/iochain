const Cryptocurrency = require('./cryptocurrency');
const bitcoin = require('bitcoinjs-lib');

const satoshi2Btc = 0.00000001;

module.exports = class Bitcoin {

  static generateWallet(opts) {
    const keyPair = bitcoin.ECPair.makeRandom(opts);
    const address = keyPair.getAddress();

    return {
      private: keyPair.toWIF(),
      public: address
    };
  }

  static addressValid(addr) {
    try {
      bitcoin.address.toOutputScript(addr);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  static async toUSD(amountSatoshi) {
    return await Cryptocurrency.convert('BTC', amountSatoshi, 'USD');
  }

  static async addressInfo(addr) {
    return await Cryptocurrency.blockchainReq(`/address/${addr}?format=json`);
  }

  // in human
  static async balanceOf(addr) {
    try {
      let result = await Cryptocurrency.blockchainReq(`/address/${addr}?format=json`);
      return parseFloat(result.final_balance) * satoshi2Btc;
    } catch(err) {
      sails.log.error(err);
      return undefined;
    }
  }

  static origValueToHuman(value) {
    return value * satoshi2Btc;
  }

  static humanValueToOrig(value) {
    return Math.floor(value / satoshi2Btc);
  }

  static getOutTxInfoOf(tx, addr) {
    return tx.out.find(t => t.addr === addr);
  }

  static getInputTxInfoOf(tx, addr) {
    return tx.inputs.find(i => i && i.prev_out && i.prev_out.addr === addr);
  }

  static async getTxsFromSourceToDestination(sourceAddr, destinationAddr) {
    const result = [];
    const addrInfo = await Bitcoin.addressInfo(destinationAddr);

    for (const tx of addrInfo.txs) {
      try {
        const existsDestTx = Bitcoin.getOutTxInfoOf(tx, destinationAddr);
        const existsSrcTx = Bitcoin.getInputTxInfoOf(tx, sourceAddr);

        if (existsDestTx && existsSrcTx) {
          result.push({
            tx,
            existsDestTx,
            amountReceived: existsDestTx.value,
            amountSent: null,
            fees: null
          });
        }
      } catch(err) {
        sails.log.error(err);
      }
    }

    return result;
  }

  static async tx(hash) {
    const tx = await Cryptocurrency.blockchainReq(`/tx/${hash}?format=json`);
    const latestBlock = await Cryptocurrency.blockchainReq(`/latestblock?format=json`);

    if ( ! tx || ! tx.block_height || ! latestBlock.height) {
      throw new Error('Invalid tx');
    }

    const nbConfirmations = latestBlock.height - tx.block_height + 1;
    tx.nb_confirmations = nbConfirmations;
    tx.status = (tx.nb_confirmations && tx.nb_confirmations >= 6) ? 'confirmed' : 'unconfirmed';

    return tx;
  }

  static calculateFinalPriceAmount(amountToTransfer, fees) {
    return Cryptocurrency.calculateFinalPriceAmount(amountToTransfer, fees);
  }

  // amount in BTC format (0.000001)
  static async makeTx(publicSourceAddr, privateSourceAddr, publicDestinationAddr, amount) {
    const infoTx = await Bitcoin.prepareTx(publicSourceAddr, privateSourceAddr, publicDestinationAddr, amount);

    await Cryptocurrency.pushTx(infoTx.hex);

    return infoTx;
  }

  static async prepareTx(publicSourceAddr, privateSourceAddr, publicDestinationAddr, amount) {
    const key = bitcoin.ECPair.fromWIF(privateSourceAddr);
    const tx = new bitcoin.TransactionBuilder();

    const hashLastTx = (await Bitcoin.addressInfo(publicSourceAddr)).txs[0].hash;

    if ( ! hashLastTx) {
      throw new Error('no hash');
    }

    tx.addInput(hashLastTx, 1);

    const amountSato = amount;

    tx.addOutput(publicDestinationAddr, amountSato);
    tx.sign(0, key);

    const hex = tx.build().toHex();

    return {
      input: hashLastTx,
      output: {
        address: publicDestinationAddr,
        amount: amountSato
      },
      hex,
      hash: tx.build().getId()
    };
  }

  static async getFeeRatesPerByteInSatoshi() {
    return await Cryptocurrency.getReq('https://bitcoinfees.earn.com/api/v1/fees/recommended');
  }

  static approximateTransactionSizeInBytes() {
    return 230;
  }

  static async getFeeRatePerByte() {
    return (await Bitcoin.getFeeRatesPerByteInSatoshi()).halfHourFee;
  }

};
