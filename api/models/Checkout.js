/**
 * Checkout.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    sid: {
      type: 'string'
    },
    email: {
      type: 'string'
    },
    payer: {
      type: 'json'
    },
    items: {
      type: 'array'
    },
    amount: {
      type: 'float'
    }
  }
};

