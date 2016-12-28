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

    if (params.pro)
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
            "items": [{
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
    }

};

