/**
 * Giftcard.js
 * @Owner       :: Khanh Tran
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required:true
    },
    thumbnail: {
      type: 'string'
    },
    description: {
      type: 'longtext'
    },
    detail: {
      type: 'longtext',
      required: true
    },
    terms: {
      type: 'longtext'
    },
    price: {
      type: 'string'
    },
    filter_category: {
      type: 'longtext'
    },
    filter_price: {
      type: 'longtext'
    },
    filter_alphabet: {
      type: 'string'
    },
    save: {
      type: 'float'
    },
    products: {
      collection: 'product',
      via: 'cid'
    },
    type: {
      model: 'type'
    }

  }
};

