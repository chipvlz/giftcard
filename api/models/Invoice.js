/**
 * Invoice.js
 * @Owner       :: Khanh Tran
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    invoice: {
      type: 'string'
    },
    intent: {
      type: 'string'
    },
    state: {
      type: 'string'
    },
    fee: {
      type: 'float'
    },
    items: {
      type: 'array'
    },
    amount: {
      type: 'float'
    },
    date: {
      type: 'string'
    },
    link: {
      type: 'string'
    },
    pay: {
      type: 'string'
    },
    codeto: {
      type: 'string'
    },
    payer: {
      type: 'string'
    },
    status: {
      type: 'string',
      defaultsTo: 'Pending'
    }

  }
};

