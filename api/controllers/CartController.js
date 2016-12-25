/**
 * CartController
 *
 * @description :: Server-side logic for managing carts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	add: (req,res) => {
    let params = req.allParams();
    console.log(params);
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
    console.log(params);
    let session_id = req.signedCookies['sails.sid'];

    Cart.find({sid:params.sid}).exec(function(err,foundCart){
      console.log(foundCart);
      res.view('cart/index',{foundCart})
    });
  }
};

