/**
 * Base.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

async function genHistory(modelName, operation, records) {
  sails.log.info(`History: model=${modelName}, operation=${operation}, records=${JSON.stringify(records)}`);
}

module.exports = function baseModel(modelName) {
  return {

    attributes: {

      //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
      //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
      //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

      //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
      //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
      //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


      //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
      //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
      //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝


    },

    pcreate: async function(values) {
      let self = this;

      let obj = await self.create(values).fetch();

      genHistory(modelName, 'create', [obj]).then(() => {

      }).catch((err) => {
        sails.log.error(err);
      });

      return obj;
    },

    pupdate: async function(criteria, changes) {
      let self = this;

      const records = await self.update(criteria).set(changes).fetch();

      genHistory(modelName, 'update', records).then(() => {

      }).catch((err) => {
        sails.log.error(err);
      });

      return records;
    },

    pdestroy: async function(criteria) {
      let self = this;

      let records = await self.destroy(criteria).fetch();

      genHistory(modelName, 'destroy', records).then(() => {

      }).catch((err) => {
        sails.log.error(err);
      });

      return records;
    }

  };
};
