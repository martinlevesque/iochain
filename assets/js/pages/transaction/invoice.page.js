/* global gSockIo */

parasails.registerPage('invoice', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {

    me: { /* ... */ },

    isBillingEnabled: false,

    hasBillingCard: false,

    // Syncing/loading states for this page.
    syncingUpdateCard: false,
    syncingRemoveCard: false,

    // Form data
    formData: { /* … */ },

    // Server error state for the form
    cloudError: '',

    // For the Stripe checkout window
    checkoutHandler: undefined,

    // For the confirmation modal:
    removeCardModalVisible: false,
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function (){
    _.extend(this, window.SAILS_LOCALS);
    this.formData.amount = this.amount;
    this.formData.currency = this.currency;
    this.formData.app = this.app;
    this.formData.publicKey = this.publicKey;
    this.formData.expiresAt = new Date(this.expiresAt);
    this.formData.qrCodeImgUrlPublicKey = 'https://blockchain.info/qr?data=' + this.publicKey;
    this.formData.status = (this.status && this.status === 'archived') ? 'archived' : 'active';
    this.formData.type = 'btc';
    this.formData.sourceAddressValid = null;
    this.formData.params = this.params;
    this.formData.userId = this.user.id;

    /*
    setInterval(() => {
      gSockIo.get('/address/info/' + self.formData.publicKey, (response) => {
        if (response && response.public === self.formData.publicKey &&
          response.status === 'archived' && self.formData.status === 'active') {
          location.reload(true);
        }
      });
    }, 3000);
    */
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    verifyAddress: function() {
      const addr = this.$data.formData.sourceAddress;
      const type = this.$data.formData.type;

      gSockIo.get(`/address/isValid/?addr=${addr}&type=${type}`, (response) => {
        this.$data.formData.sourceAddressValid = response.result;
        this.$forceUpdate();

        if (this.$data.formData.sourceAddressValid) {
          const invoice = {
            type,
            paidByAddress: addr,
            params: this.formData.params,
            merchant: this.formData.userId,
            application: this.formData.app.id
          };

          gSockIo.post('/publicInvoice/create/', invoice, () => {
          });
        }
      });
    }
  }
});
