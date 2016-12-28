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
    if (params.page == 'create') {

      var create_invoice_json = {
        "merchant_info": {
          "email": "PPX.DevNet-facilitator@gmail.com",
          "first_name": "Dennis",
          "last_name": "Doctor",
          "business_name": "Medical Professionals, LLC",
          "phone": {
            "country_code": "001",
            "national_number": "5032141716"
          },
          "address": {
            "line1": "1234 Main St.",
            "city": "Portland",
            "state": "OR",
            "postal_code": "97217",
            "country_code": "US"
          }
        },
        "billing_info": [{
          "email": "kingasawa@gmail.com"
        }],
        "items": [{
          "name": "iTunes Gift Card",
          "quantity": 1,
          "unit_price": {
            "currency": "USD",
            "value": 500
          }
        }],
        "note": "Thank you for buy gift card",
        "payment_term": {
          "term_type": "NET_45"
        },
        "shipping_info": {
          "first_name": "Khanh",
          "last_name": "Tran",
          "business_name": "Not applicable",
          "phone": {
            "country_code": "84",
            "national_number": "989333900"
          },
          "address": {
            "line1": "378 Le Loi.",
            "city": "VungTau",
            "state": "BRVT",
            "postal_code": "790000",
            "country_code": "VN"
          }
        },
        "tax_inclusive": false,
        "total_amount": {
          "currency": "USD",
          "value": "500.00"
        }
      };

      paypal.invoice.create(create_invoice_json, function (error, invoice) {
        if (error) {
          throw error;
        } else {
          console.log("Create Invoice Response");
          res.json(invoice);
        }
      });

    } else if (params.page == 'get') {
      var invoiceId = params.id;
      paypal.invoice.get(invoiceId, function (error, invoice) {
        if (error) {
          throw error;
        } else {
          console.log("Get Invoice Response");
          res.json(JSON.stringify(invoice));
        }
      });
    } else if (params.page == 'payment') {
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



  }
};

