/**
 * Cart.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    date: {
      type: 'string'
    },
    pid : {
      type: 'integer'
    },
    sid: {
      type: 'string'
    },
    image: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    type: {
      type: 'string'
    },
    value: {
      type: 'float'
    },
    save: {
      type: 'float'
    },
    price: {
      type: 'float'
    }
  }
};

