/**
 * Product.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    code: {
      type: 'string',
      unique: true
    },
    value: {
      type: 'integer',
      required: true
    },
    price: {
      type: 'integer',
      required: true
    },
    quantity: {
      type: 'integer',
      defaultsTo: 1
    },
    status: {
      type: 'string'
    },
    cid: {
      model: 'giftcard'
    }
  }
};

