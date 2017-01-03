/**
 * Product.js
 * @Owner       :: Khanh Tran
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string'
    },
    code: {
      type: 'string',
      unique: true
    },
    value: {
      type: 'float',
      required: true
    },
    price: {
      type: 'float',
      required: true
    },
    save: {
      type: 'float'
    },
    quantity: {
      type: 'integer',
      defaultsTo: 1
    },
    status: {
      type: 'string',
      defaultsTo: 'Active'
    },
    cid: {
      model: 'giftcard'
    },
    owner: {
      model: 'user'
    },
    belong: {
      model: 'belong'
    }
  }
};

