/**
 * GiftcardController
 *
 * @description :: Server-side logic for managing giftcards
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index: (req,res) => {
	  Giftcard.find().populate('type')
      .exec(function(err,foundCard){
        if (err) return res.negotiate(err);
        else return res.view('giftcard/index',{foundCard})
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

  }
};

