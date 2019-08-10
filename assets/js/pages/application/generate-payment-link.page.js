parasails.registerPage('generate-payment-link', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {

    // Main syncing/loading state for this page.
    syncing: false,

    // Form data
    formData: { /* … */ },

    // For tracking client-side validation errors in our form.
    // > Has property set to `true` for each invalid property in `formData`.
    formErrors: { /* … */ },

    // Server error state for the form
    cloudError: '',

  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    // Attach raw data exposed by the server.
    _.extend(this, SAILS_LOCALS);

    // Set the form data.
    this.formData.app = this.app;
    this.formData.baseLink = this.baseInvoiceUrl;
    this.formData.userId = this.me.id;
    this.formData.currency = 'USD';
    this.formData.amount = 0.0;
    this.formData.variables = [];

    this.updLink();
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  computed: {
    // un accesseur (getter) calculé

  },

  methods: {

    updLink: function() {

      let extra = '';

      const variables = this.$data.formData.variables.filter(v => v.name && v.name !== '' && v.value !== '');

      if (variables.length > 0) {
        extra = '?' + variables.map(v => `${v.name}=${v.value}`).join('&');


      }

      this.$data.formData.link = `${this.formData.baseLink}` +
        `transaction/${this.formData.userId}-${this.formData.app.id}/amount/` +
        this.formData.amount  + `/currency/${this.formData.currency}/${extra}`;

      this.$forceUpdate();
    },

    addVariable: function() {
      this.$data.formData.variables.push({
        name: '',
        value: ''
      });

      this.$forceUpdate();
    },

    submittedForm: function() {

      // this.syncing = true;
      // window.location = '/account';

    },

    handleParsingForm: function() {


      var argins = this.formData;


      return argins;
    },

  }
});
