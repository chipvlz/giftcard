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

    paypal.invoice.create(create_invoice_json, function (error, invoice) {
      if (error) {
        throw error;
      } else {
        console.log(invoice);
        sails.sockets.broadcast(params.sessionId,'checkout/step2',{invoice:invoice.id,sid:params.sessionId});
      }
    });
  }
};

