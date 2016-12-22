/**
 * Usergroup.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string'
    },
    admin: {
      type: 'integer',
      defaultsTo: 0
    },
    seller: {
      type: 'integer',
      defaultsTo: 0
    },
    buyer: {
      type: 'integer',
      defaultsTo: 1
    },
    moderator: {
      type: 'integer',
      defaultsTo: 0
    },
    member: {
      type: 'integer',
      defaultsTo: 1
    },
    ban: {
      type: 'integer',
      defaultsTo: 0
    },
    users: {
      collection: 'user',
      via: 'groupid'
    }

  }
};

