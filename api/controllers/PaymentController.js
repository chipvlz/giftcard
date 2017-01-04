/**
 * PaymentController
 * @Owner       :: Khanh Tran
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// var paypal = require('./lib/paypal-rest-sdk.js')();
var paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'ATyTjOEXX-Hagf9aE1wpeHgTZI92xIRIpUtj1wazEkM24hrkv3XGTxJ3hXkcGo4cDz7aPl26imF7IBXl',
  'client_secret': 'ECEHhrXk8nukf2vp1x_oRPQYskT0fxCryzJ4Uqw1rsWbLFMw2OcMOTzMbyTOQOTjh08pJzgScW4f21iN',

});

module.exports = {
  index: (req,res) => {
    res.view('cart/success');
    },
  test: (req,res) => {
    let params = req.allParams();
    console.log(params);
    sails.sockets.join(req,params.sessionId);

    var create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": "http://vnmagic.net:2810/payment/confirm",
        "cancel_url": "http://vnmagic.net:2810/cart"
      },
      "transactions": [{
        "item_list": {
          "items": params.jsonData
        },
        "amount": {
          "currency": "USD",
          "total": params.totalData
        },
        "description": "Thank you for buying iTunes Gift Card."
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
            sails.sockets.broadcast(params.sessionId,'create/invoice',{msg:result.invoice});
            // sails.sockets.blast('create/invoice',{msg:result.invoice});
          }
        })
      }
    });
  },

  checkout: (req,res) => {
    let params = req.allParams();
    console.log('invoice params',params);
    Invoice.findOne(params).exec(function(err,foundInvoice){
      return res.view('cart/invoice',foundInvoice);
    })
  },

  confirm: (req,res) => {
    let params = req.allParams();
    console.log('confirm params',params);

    var execute_payment_json = {
      "payer_id": params.PayerID
    };

    var paymentId = params.paymentId;

    paypal.payment.execute(paymentId, execute_payment_json, function (error,payment) {
      if (error) {
        console.log(error.response);
        throw error;
      }
      else {
        //update new record
        Invoice.update({invoice:payment.id},{
          state: payment.state,
          payer: payment.payer.payer_info.payer_id,
          status: 'Complete'
        }).exec(function(err,updateDone){
          if (err) { res.json(err) }
        });

        Payer.findOne({payerid:payment.payer.payer_info.payer_id}).exec(function(err,foundPayer){
          if (foundPayer) {
            console.log('found payer, no create new')
          } else {
            Payer.create({
              email: payment.email,
              payerid: payment.payer.payer_info.payer_id,
              name: payment.payer.payer_info.shipping_address.recipient_name,
              address: payment.payer.payer_info.shipping_address.line1,
              city: payment.payer.payer_info.shipping_address.city,
              state: payment.payer.payer_info.shipping_address.state,
              postal_code: payment.payer.payer_info.shipping_address.postal_code,
              country: payment.payer.payer_info.shipping_address.country_code,
              method: payment.payer.payment_method,
              acc_status: payment.payer.status
            }).exec(function(err){
              if (err) { res.json(err); }
            })
          }
        });

        var itemsList = payment.transactions[0].item_list.items;
        // Each item -> payment.transactions[0].item_list.items
        for (var i=0;i<itemsList.length;i++) {
          let findId = itemsList[i].sku;
          let findPrice = itemsList[i].price;

          Cart.destroy({pid:findId}).exec(function(err){
            if (err) { return res.negotiate(err); }
          });

          Invoice.findOne({invoice:payment.id}).exec(function(err,foundInvoice){
            console.log('invoice',foundInvoice);
            if (foundInvoice) {
              console.log('pid:',findId);
              console.log('bid:',foundInvoice.codeto);
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
                  let newbalance = parseFloat(foundUser.balance)+parseFloat(findPrice);
                  User.update({id:foundProduct.owner},{balance:newbalance}).exec(function(err,result){
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

    });
  },

  success: (req,res) => {
    let params = req.allParams();
    Invoice.findOne({invoice:params.paymentId}).exec(function(err,foundInvoice){
      res.view('cart/success',foundInvoice)
    });

  },

  invoice: (req,res) => {
    let params = req.allParams();
    Invoice.findOne({invoice:params.id}).exec(function(err,foundInvoice){
      res.view('user/invoice',foundInvoice)
    });
  }

};

