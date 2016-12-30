/**
 * PaymentController
 *
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
    let params = req.allParams();


    var create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "http://return.url",
          "cancel_url": "http://cancel.url"
        },
        "transactions": [{
          "item_list": {
            "items": [
              {
              "name": "iTunes Gift Card",
              "sku": "JAGDGS",
              "price": "131.11",
              "currency": "USD",
              "quantity": 1
              }]
          },
          "amount": {
            "currency": "USD",
            "total": "131.11"
          },
          "description": "Thank you for buying iTunes Gift Card."
        }]
      };


      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          console.log("Create Payment Response");
          res.json(payment);
        }
      });
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
          pay: payment.links[2].href
        }).exec(function(err,result){
          if (err) return res.negotiate(err);
          else {
            console.log(result);
            sails.sockets.broadcast(params.sessionId,'create/invoice',{msg:result.invoice});
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

    var paymentId = params.PaymentId;
    paypal.payment.get(paymentId, function (error, payment) {
      if (error) {
        console.log(error);
        throw error;
      } else {
        console.log("Get Payment Response");
        res.json(JSON.stringify(payment));
      }

    });

    // paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    //   if (error) {
    //     console.log(error.response);
    //     throw error;
    //   } else {
    //     console.log("Get Payment Response");
    //     res.json(JSON.stringify(payment));
    //   }
    // });
  },

  success: (req,res) => {
    res.view('cart/success')
  }

};

