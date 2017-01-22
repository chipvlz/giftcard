/**
 * InvoiceController
 *
 * @description :: Server-side logic for managing invoices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'ATyTjOEXX-Hagf9aE1wpeHgTZI92xIRIpUtj1wazEkM24hrkv3XGTxJ3hXkcGo4cDz7aPl26imF7IBXl',
  'client_secret': 'ECEHhrXk8nukf2vp1x_oRPQYskT0fxCryzJ4Uqw1rsWbLFMw2OcMOTzMbyTOQOTjh08pJzgScW4f21iN',

});
// let data = {sessionId,itemData,customerEmail,customerData,totalAmount};
module.exports = {
	create: (req,res) => {
	  let params = req.allParams();
    console.log('params checkout',params);
    sails.sockets.join(req,params.sessionId);
    var create_invoice_json = {
      "merchant_info": {
        "email": "trancatkhanh-facilitator@gmail.com",
        "first_name": "Khanh",
        "last_name": "Tran",
        "business_name": "VNMAGIC Team",
        // "phone": {
        //   "country_code": "001",
        //   "national_number": "5032141716"
        // },
        "address": {
          "line1": "378 Le Loi",
          "city": "Vung Tau",
          "state": "BRVT",
          "postal_code": "790000",
          "country_code": "VN"
        }
      },
      "billing_info": [{
        "email": params.customerEmail
      }],
      "items": params.itemData,
      "note": "",
      "shipping_info": params.customerData,

      "total_amount": params.totalAmount
    };
    Checkout.create({
      sid: params.sessionId,
      payer: params.customerData,
      email: params.customerEmail,
      items: params.itemData,
      amount: params.totalAmount
    }).exec(function(){

    })

  },

  checkout: (req,res) => {
    var create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "credit_card",
        "funding_instruments": [{
          "credit_card": {
            "type": "visa",
            "number": "4417119669820331",
            "expire_month": "11",
            "expire_year": "2018",
            "cvv2": "874",
            "first_name": "Joe",
            "last_name": "Shopper",
            "billing_address": {
              "line1": "52 N Main ST",
              "city": "Johnstown",
              "state": "OH",
              "postal_code": "43210",
              "country_code": "US"
            }
          }
        }]
      },
      "redirect_urls": {
        "return_url": "http://return.url",
        "cancel_url": "http://cancel.url"
      },
      "transactions": [{
        "item_list": {
          "items": [{
            "name": "item",
            "sku": "item",
            "price": "1.00",
            "currency": "USD",
            "quantity": 1
          }]
        },
        "amount": {
          "currency": "USD",
          "total": "1.00"
        },
        "description": "This is the payment description."
      }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        console.log("Create Payment Response");
        console.log(payment);
      }
    });
  }
};

