/**
 * CartController
 * @Owner       :: Khanh Tran
 * @description :: Server-side logic for managing carts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	add: (req,res) => {
    let params = req.allParams();
    let session_id = req.signedCookies['sails.sid'];

    sails.sockets.join(req,session_id);
      let addData = {
        date: (new Date()).toString(),
        pid: params.id,
        sid: session_id,
        image: params.img,
        name : params.name,
        type : params.type,
        value : params.value,
        save : params.save,
        price : params.price
      };
    Cart.create(addData).exec(function(err,result){
      sails.sockets.broadcast(session_id,'add-to-cart',{msg:result});
    });
  },
  view: (req,res) => {
    let params = req.allParams();
    let session_id = req.signedCookies['sails.sid'];

    Cart.find({sid:params.sid}).exec(function(err,foundCart){
      res.view('cart/index',{foundCart})
    });
  },

  remove: (req,res) => {
    if (!req.isSocket) {return res.badRequest();}
    let params = req.allParams();

    sails.sockets.join(req,params.sessionId);
    Cart.destroy({id:params.id}).exec(function(err){
      if (err) return res.negotiate(err);
      else sails.sockets.broadcast(params.sessionId,'remove/cart');
    })
  }
};

