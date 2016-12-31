/**
 * GiftcardController
 *
 * @description :: Server-side logic for managing giftcards
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index: (req,res) => {
    Type.find().exec(function(err,foundType) {
      Giftcard.find().populate('type')
        .exec(function (err, foundCard) {
          if (err) return res.negotiate(err);
          else return res.view('giftcard/index', {foundCard,foundType})
        })
    })
  },

  view: (req,res) => {
    let params = req.allParams();
    let session_id = req.signedCookies['sails.sid'];
    Cart.find({sid:session_id}).exec(function(err,foundCart){
        Giftcard.findOne({id:params.id}).populate('products').populate('type')
          .exec(function(err,foundCard) {
            if (err) return res.negotiate(err);
            else {
              return res.view('giftcard/view',{foundCard,foundCart})
            }
          })

    });
  },

  filter: (req,res) => {
    let params = req.allParams();
    if (params.by == 'price') {
      Type.find().exec(function(err,foundType) {
        Giftcard.find({filter_price: {'contains': params.price}}).exec(function (err, foundCard) {
          return res.view('giftcard/index', {foundCard,foundType})
        })
      })
    } else if (params.by == 'type') {
      Type.find().exec(function(err,foundType) {
        Giftcard.find({type:params.type}).exec(function (err, foundCard) {
          return res.view('giftcard/index',{foundCard,foundType})
        })
      })
    }
  },

  search: (req,res) => {
    let params = req.allParams();
    sails.sockets.join(req,params.key);
    Giftcard.find({name: {'startsWith':params.key}}).exec(function(err,foundCard){
      sails.sockets.broadcast(params.key,'live/search',{msg:foundCard})
    })
  }
};

