parasails.registerPage('list-transactions', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {

    me: { /* ... */ },

    // Form data
    formData: { /* … */ },

    // Server error state for the form
    cloudError: '',

    // For the confirmation modal:
    removeAppModalVisible: false,
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function (){
    _.extend(this, window.SAILS_LOCALS);

  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    clickRemoveAppButton: function(id) {
      this.removeAppModalVisible = true;
      console.log('clicked id = ', id);
      this.formData.clickedId = id;
    },

    closeRemoveAppModal: function() {
      this.removeAppModalVisible = false;
      this.cloudError = false;
    },

    submittedRemoveAppForm: function() {

      // Close the modal and clear it out.
      this.closeRemoveAppModal();

      this.syncing = true;
      window.location = '/application/list';

    },

    handleParsingRemoveAppForm: function() {
      console.log('formmmdata');
      console.log(this.formData);
      return {
        id: this.formData.clickedId
      };
    },

  }
});
