/**
 * CheckoutController
 *
 * @description :: Server-side logic for managing checkouts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index: (req,res) => {
    var create_invoice_json = {
      "billing_info": [{
        "email": "example@example.com"
      }],
      "items": [{
        "name": "Sutures",
        "quantity": 100.0,
        "unit_price": {
          "currency": "USD",
          "value": 5
        }
      }],
      "note": "Medical Invoice 16 Jul, 2013 PST",
      "shipping_info": {
        "first_name": "Sally",
        "last_name": "Patient",
        "address": {
          "line1": "1234 Broad St.",
          "city": "Portland",
          "state": "OR",
          "postal_code": "97216",
          "country_code": "US"
        }
      },
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
        console.log(invoice);
      }
    });
  }
};

