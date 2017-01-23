/**
 * CartController
 * @Owner       :: Khanh Tran
 * @description :: Server-side logic for managing carts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'ATyTjOEXX-Hagf9aE1wpeHgTZI92xIRIpUtj1wazEkM24hrkv3XGTxJ3hXkcGo4cDz7aPl26imF7IBXl',
  'client_secret': 'ECEHhrXk8nukf2vp1x_oRPQYskT0fxCryzJ4Uqw1rsWbLFMw2OcMOTzMbyTOQOTjh08pJzgScW4f21iN',

});
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
    if (!params.step) {
      Cart.find({sid:params.sid}).exec(function(err,foundCart){
        res.view('cart/checkout',{foundCart})
      });
    } else if (params.step == 'payment_method') {
      sails.sockets.join(req,params.sessionId);
      Checkout.create({
        sid: params.sessionId,
        payer: params.customerData,
        email: params.customerEmail,
        transactions: params.jsonData
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
    sails.sockets.join(req,params.sid);
    Checkout.findOne({sid:params.sid}).exec(function(err,foundCheckout){
      if (foundCheckout) {
        var create_payment_json = {
          "intent": "sale",
          "payer": foundCheckout.payer,
          "redirect_urls": {
            "return_url": "http://vnmagic.net:2810/payment/confirm",
            "cancel_url": "http://vnmagic.net:2810/cart"
          },
          "transactions": foundCheckout.transactions
        };

        paypal.payment.create(create_payment_json, function (error,payment) {
          if (error) {
            throw error;
          } else {
            console.log('payment response',payment.links);
            Invoice.create({
              invoice: payment.id,
              intent: payment.intent,
              state: payment.state,
              amount: payment.transactions[0].amount.total,
              items: payment.transactions[0].item_list.items,
              date: payment.create_time,
              link: payment.links[0].href,
              codeto: foundCheckout.email
            }).exec(function(err,result){
              if (err) return res.negotiate(err);
              else {

                Invoice.update({invoice:payment.id},{
                  fee: 0,
                  state: payment.state,
                  payer: payment.payer.funding_instruments[0].credit_card.number,
                  status: 'Complete'
                }).exec(function(err,updateDone){
                  if (err) { res.json(err) }
                  else sails.sockets.broadcast(params.sid,'payment/complete',{msg:payment.id});
                });

                var itemsList = payment.transactions[0].item_list.items;

                for (var i=0;i<itemsList.length;i++) {
                  let findId = itemsList[i].sku;
                  // let transactionFee = parseFloat(payment.transactions[0].related_resources[0].sale.transaction_fee.value)/3;
                  let findPrice = itemsList[i].price;

                  Cart.destroy({pid:findId}).exec(function(err){
                    if (err) { return res.negotiate(err); }
                  });

                  Invoice.findOne({invoice:payment.id}).exec(function(err,foundInvoice){
                    console.log('invoice',foundInvoice);
                    if (foundInvoice) {

                      Belong.create({pid:findId,bid:foundInvoice.codeto}).exec(function(err,createDone){
                        console.log('create new belong product',createDone);
                      })
                    }
                  });

                  Product.update({id:findId},{status:'Sold'}).exec(function(err,updateProduct){
                    sails.sockets.blast('update/product/sold',{msg:updateProduct.id})
                  });

                  Product.findOne({id:findId}).exec(function(err,foundProduct){
                    if (foundProduct) {
                      User.findOne({id:foundProduct.owner}).exec(function(err,foundUser){
                        if (foundUser) {
                          let newbalance = parseFloat(foundUser.balance)+parseFloat(findPrice)-0;
                          User.update({id:foundProduct.owner},{balance:parseFloat(newbalance).toFixed(2)}).exec(function(err,result){
                            console.log(result);
                            sails.sockets.blast('update/balance',{msg:result})
                          })
                        }

                      })
                    }
                  })
                }

                // Realtime
                sails.sockets.blast('product/sold',{data:payment});
                return res.redirect('/payment/success?paymentId='+payment.id);
              }
            })
          }
        });


      }
    })
  }

};

