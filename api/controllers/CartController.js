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
  },

  checkout: (req,res) => {
    let params = req.allParams();
    console.log(params);
    sails.sockets.join(req,params.sessionId);
    if (!params.step) {
      Cart.find({sid:params.sid}).exec(function(err,foundCart){
        res.view('cart/checkout',{foundCart})
      });
    } else if (params.step == 'payment_method') {
      Checkout.create({
        sid: params.sessionId,
        payer: params.customerData,
        email: params.customerEmail,
        items: params.itemData,
        amount: params.totalAmount
      }).exec(function(err,createCheckout) {
        sails.sockets.broadcast(params.sessionId,'create/checkout',{msg:createCheckout})
      })
    } else if (params.step == 'payment_confirm') {
      Cart.find({sid:params.sid}).exec(function(err,foundCart) {
        Checkout.findOne({sid: params.sid}).exec(function (err, foundCheckout) {
          res.view('cart/payment_confirm', {foundCheckout,foundCart});
        })
      })
    }
  },

  complete: (req,res) => {
    let params = req.allParams();
    console.log(params);
    Checkout.findOne({sid:params.sid}).exec(function(err,foundCheckout){
      if (foundCheckout) {
        var create_payment_json = {
          "intent": "sale",
          "payer": foundCheckout.payer,
          "redirect_urls": {
            "return_url": "http://vnmagic.net:2810/payment/confirm",
            "cancel_url": "http://vnmagic.net:2810/cart"
          },
          "transactions": [{
            "item_list": foundCheckout.items,
            "amount": {
              "currency": "USD",
              "total": foundCheckout.amount
            },
            "description": "Thank you for your complete order."
          }]
        };

        paypal.payment.create(create_payment_json, function (error,payment) {
          if (error) {
            throw error;
          } else {
            Invoice.create({
              invoice: payment.id,
              intent: payment.intent,
              state: payment.state,
              amount: payment.transactions[0].amount.total,
              items: payment.transactions[0].item_list.items,
              date: payment.create_time,
              link: payment.links[1].href,
              pay: payment.links[2].href,
              codeto: params.codeto
            }).exec(function(err,result){
              if (err) return res.negotiate(err);
              else {
                console.log(result);
                sails.sockets.broadcast(params.sessionId,'create/invoice',{msg:result.link});
                // sails.sockets.blast('create/invoice',{msg:result.invoice});
              }
            })
          }
        });


      }
    })
  }

};

