const expect = require('expect.js');
const Bitcoin = require('../../../../../api/lib/blockchain/btc');
const nock = require('nock');
global.sails = require('sails');

describe('bitcoin', () => {

  beforeEach(() => {
    nock.cleanAll();
  });

  describe('fees', () => {

    beforeEach(() => {
      nock('https://bitcoinfees.earn.com/')
          .get(`/api/v1/fees/recommended`)
          .reply(200, require('./fixtures/btc-fees-recommended'));
    });

    describe('fees to use', () => {
      it('return proper fee', (done) => {
        Bitcoin.getFeeRatePerByte().then((fees) => {
          expect(fees).to.equal(40);
          done();
        }).catch((err) => done(err));
      });
    });

    describe('recommended', () => {

      it('get half hour fee', (done) => {

        Bitcoin.getFeeRatesPerByteInSatoshi().then((rates) => {
          expect(rates.halfHourFee).to.equal(40);
          done();
        }).catch((err) => done(err));
      });

      it('get hour fee', (done) => {


        Bitcoin.getFeeRatesPerByteInSatoshi().then((rates) => {
          expect(rates.hourFee).to.equal(20);
          done();
        }).catch((err) => done(err));
      });
    });
  });

  describe('generate wallet', () => {
    it('specific rng', () => {
      const result = Bitcoin.generateWallet({
        rng: () => {
          return Buffer.from('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz');
        }
      });
      expect(result).to.be;
      expect(result.public).to.equal('1F5VhMHukdnUES9kfXqzPzMeF1GPHKiF64');
      expect(result.private).to.equal('L1Knwj9W3qK3qMKdTvmg3VfzUs3ij2LETTFhxza9LfD5dngnoLG1');
    });
  });

  describe('validate address', () => {
    it('with valid one', () => {
      expect(Bitcoin.addressValid('1LYPaDZKPvmELGxVkdBEV2ZqjimXk4vNji')).to.equal(true);
    });

    it('with invalid one', () => {
      expect(Bitcoin.addressValid('aaaabbbccc')).to.equal(false);
    });
  });

  describe('address info', () => {
    it('with valid addr', (done) => {
      Bitcoin.addressInfo('3GXs2XCjKRZ8JPBdV2e4YBao4f2vZUh8Pc').then((body) => {
        expect(body.address).to.equal('3GXs2XCjKRZ8JPBdV2e4YBao4f2vZUh8Pc');
        expect(body.n_tx).to.equal(2);
        expect(body.total_received).to.equal(370000);
        expect(body.total_sent).to.equal(370000);
        expect(body.final_balance).to.equal(0);
        done();
      });
    });
  });

  describe('balanceOf', () => {
    it('with valid addr and 0 balance', (done) => {
      Bitcoin.balanceOf('3GXs2XCjKRZ8JPBdV2e4YBao4f2vZUh8Pc').then((body) => {
        expect(body).to.equal(0.0);
        done();
      });
    });

    it('with valid addr and certain balance', (done) => {
      nock('https://blockchain.info/')
          .get('/address/tititototutu?format=json')
          .reply(200, {
            final_balance: 5600000
          });

      Bitcoin.balanceOf('tititototutu').then((body) => {
        expect(body).to.equal(0.056);
        done();
      });
    });
  });

  describe('tx', () => {
    it('check basic fields present with valid transaction', (done) => {
      Bitcoin.tx('d18e7106e5492baf8f3929d2d573d27d89277f3825d3836aa86ea1d843b5158b').then((body) => {
        expect(body.block_height > 0).to.equal(true);
        expect(body.out.length > 0).to.equal(true);
        expect(body.inputs.length > 0).to.equal(true);
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('nb confirmations and status calculation valid with confirmed tx', (done) => {
      nock('https://blockchain.info/')
          .get('/tx/prettyhash?format=json')
          .reply(200, {
            block_height: 338041
          });

      nock('https://blockchain.info/')
          .get('/latestblock?format=json')
          .reply(200, {
            height: 500000
          });

      Bitcoin.tx('prettyhash').then((body) => {
        expect(body.nb_confirmations).to.equal(500000 - 338041 + 1);
        expect(body.status).to.equal('confirmed');
        done();
      });
    });

    it('nb confirmations and status calculation valid with unconfirmed tx', (done) => {
      nock('https://blockchain.info/')
          .get('/tx/prettyhash?format=json')
          .reply(200, {
            block_height: 499998
          });

      nock('https://blockchain.info/')
          .get('/latestblock?format=json')
          .reply(200, {
            height: 500000
          });

      Bitcoin.tx('prettyhash').then((body) => {
        expect(body.nb_confirmations).to.equal(500000 - 499998 + 1);
        expect(body.status).to.equal('unconfirmed');
        done();
      });
    });

    it('nb confirmations and status calculation not found with invalid tx', (done) => {
      nock('https://blockchain.info/')
          .get('/tx/prettyhash2?format=json')
          .reply(500, 'not found');

      nock('https://blockchain.info/')
          .get('/latestblock?format=json')
          .reply(200, {
            height: 500000
          });

      Bitcoin.tx('prettyhash2').then(() => {
        done('should not pass');
      }).catch(() => {
        done();
      });
    });
  });

  describe('Prepare Transaction', () => {
    it('regular creation', (done) => {
      const sourcePublicAddr = '1EL7aDHxfmC3rJSjR8GxP4X4xRG6B5KT6K';
      const privateAddr = 'L4kJjaCpaFBrkbCwbvyUDwC8nGVs1LeFmPQ2wHjHJRxKpybkpvJK';
      const destPublicAddr = '1F5VhMHukdnUES9kfXqzPzMeF1GPHKiF64';

      nock('https://blockchain.info/')
          .get(`/address/${sourcePublicAddr}?format=json`)
          .reply(200, require('./fixtures/address1EL7aDHxfmC3rJSjR8GxP4X4xRG6B5KT6K.js'));

      Bitcoin.prepareTx(sourcePublicAddr, privateAddr, destPublicAddr, 11000)
      .then((infoTx) => {
        expect(infoTx.input).to.equal('18f873da171be1d0c2518399eccbea889afbe1e5c4863a2dd1985d311bd6b288');
        expect(infoTx.output.amount).to.equal(11000);
        expect(infoTx.output.address).to.equal(destPublicAddr);
        expect(infoTx.hex).to.equal('010000000188b2d61b315d98d12d3a86c4e5e1fb9a88eacbec998351c2d0e11b17da73f818010000006a4730440220144c355821565070eb0c315615e83a4d84919e3ca65738cf2e3a76cbb916221002204428eb0796f4902e45b578aca1076faf1ecb81beea38830b7340d1ad7499bf5e012102882a92bf56f0753a5a80cb8d0adec488a7cc88efd057968cca1edd0536de1c1fffffffff01f82a0000000000001976a9149a6b60f74a6bae176df05c3b0a118f85bab5c58588ac00000000');
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('with err', (done) => {
      const sourcePublicAddr = '1EL7aDHxfmC3rJSjR8GxP4X4xRG6B5KT6K';
      const privateAddr = 'L4kJjaCpaFBrkbCwbvyUDwC8nGVs1LeFmPQ2wHjHJRxKpybkpvJK';
      const destPublicAddr = '1F5VhMHukdnUES9kfXqzPzMeF1GPHKiF64';

      nock('https://blockchain.info/')
          .get(`/address/${sourcePublicAddr}?format=json`)
          .reply(500, {});

      Bitcoin.prepareTx(sourcePublicAddr, privateAddr, destPublicAddr, 11000)
      .catch(() => {
        done();
      });
    });
  });

  describe('Make Transaction', () => {
    it('regular creation', (done) => {
      const sourcePublicAddr = '1EL7aDHxfmC3rJSjR8GxP4X4xRG6B5KT6K';
      const privateAddr = 'L4kJjaCpaFBrkbCwbvyUDwC8nGVs1LeFmPQ2wHjHJRxKpybkpvJK';
      const destPublicAddr = '1F5VhMHukdnUES9kfXqzPzMeF1GPHKiF64';

      nock('https://blockchain.info/')
          .get(`/address/${sourcePublicAddr}?format=json`)
          .reply(200, require('./fixtures/address1EL7aDHxfmC3rJSjR8GxP4X4xRG6B5KT6K.js'));

      nock('https://blockchain.info/')
          .post(`/pushtx`, 'tx=010000000188b2d61b315d98d12d3a86c4e5e1fb9a88eacbec998351c2d0e11b17da73f818010000006a4730440220144c355821565070eb0c315615e83a4d84919e3ca65738cf2e3a76cbb916221002204428eb0796f4902e45b578aca1076faf1ecb81beea38830b7340d1ad7499bf5e012102882a92bf56f0753a5a80cb8d0adec488a7cc88efd057968cca1edd0536de1c1fffffffff01f82a0000000000001976a9149a6b60f74a6bae176df05c3b0a118f85bab5c58588ac00000000')
          .reply(200, {});

      Bitcoin.makeTx(sourcePublicAddr, privateAddr, destPublicAddr, 11000)
      .then((result) => {
        expect(result.hash).to.equal('16c1d8124698957ca0a4349336a9388297f2b227f4ae6d83f313168ac3bf2f3f');
        done();
      }).catch((err) => {
        done(err);
      });
    });
  });

  describe('getTxsFromSourceToDestination', () => {
    it('regular addr 2 destination', (done) => {
      const sourcePublicAddr = '1EvQUoukdKY5Fw3mqAx5AnaM4qogB5k6qZ';
      const destPublicAddr = '17hFoVScNKVDfDTT6vVhjYwvCu6iDEiXC4';

      nock('https://blockchain.info/')
          .get(`/address/${destPublicAddr}?format=json`)
          .reply(200, require('./fixtures/address17hFoVScNKVDfDTT6vVhjYwvCu6iDEiXC4.js'));

      Bitcoin.getTxsFromSourceToDestination(sourcePublicAddr, destPublicAddr)
      .then((result) => {
        const firstTx = result[0];
        expect(firstTx.tx.hash).to.equal('d18e7106e5492baf8f3929d2d573d27d89277f3825d3836aa86ea1d843b5158b');
        expect(firstTx.amountReceived).to.equal(150000);
        // expect(firstTx.fees).to.equal(1000);
        done();
      }).catch((err) => {
        done(err);
      });
    });
  });


  describe('calculateFinalPriceAmount', () => {
    it('with proper amount', () => {
      expect(Bitcoin.calculateFinalPriceAmount(7.00, 0.50)).to.equal(6.50);
    });

    it('without fees should fail', () => {
      try {
        Bitcoin.calculateFinalPriceAmount(7.00, null);
      } catch(err) {
        expect(err.message).to.equal('no fees provided');
      }
    });

    it('with fees larger than amount', () => {
      try {
        Bitcoin.calculateFinalPriceAmount(7.00, 8.00);
      } catch(err) {
        expect(err.message).to.equal('final amount should be >= 0');
      }
    });
  });

  describe('origValueToHuman', () => {
    it('should work properly', () => {
      expect(Bitcoin.origValueToHuman(10000)).to.equal(10000 * 0.00000001);
    });
  });

  describe('humanValueToOrig', () => {
    it('should work properly', () => {
      expect(Bitcoin.humanValueToOrig(0.000001)).to.equal(0.000001 / 0.00000001);
    });
  });

});
