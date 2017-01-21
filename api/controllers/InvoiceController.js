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
        "email": params.customerEmail
      }],
      "items": params.itemData,
      "note": "",
      "shipping_info": params.customerData,

      "total_amount": params.totalAmount
    };

    paypal.invoice.create(create_invoice_json, function (error, invoice) {
      if (error) {
        throw error;
      } else {
        console.log("Create Invoice Response");
        console.log(invoice);
      }
    });
  }
};

