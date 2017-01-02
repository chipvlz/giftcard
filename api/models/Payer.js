/**
 * Payer.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    email: {
      type: 'string'
    },
    payerid: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    address: {
      type: 'string'
    },
    city: {
      type: 'string'
    },
    state: {
      type: 'string'
    },
    postal_code: {
      type: 'string'
    },
    country: {
      type: 'string'
    },
    paymentid: {
      type: 'string'
    },
    method: {
      type: 'string'
    },
    acc_status: {
      type: 'string'
    }

  }
};

