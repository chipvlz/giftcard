/**
 * LoginController
 * @Owner       :: Khanh Tran
 * @description :: Server-side logic for managing logins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  index: (req, res) => {
    console.log('headers',req.headers);
    res.view("user/login",req.headers);
  },

  register: (req, res) => {
    res.view("user/register");
  }
};

