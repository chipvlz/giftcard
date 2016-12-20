/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
// import QueryBuilder from 'datatable';
// var QueryBuilder = require('datatable');

module.exports = {
  index: (req,res) => {
    let data = {
      userName: 'Khanh Admin',
      testVariable: 'this is test value'
    };
    return res.view('admin/index', data)
  },

  giftcard: (req,res) => {
    let params = req.allParams();
    Giftcard.find().exec(function(err,foundGiftcard){
      if (err) return res.negotiate(err);
      else return res.view('admin/giftcard',{foundGiftcard})
    })
  },

  product: (req,res) => {
    let params = req.allParams();
    Product.find().exec(function(err,foundProduct){
      if (err) return res.negotiate(err);
      else return res.view('admin/product',{foundProduct})
    })
  },

  type: (req,res) => {
      Type.find().exec(function(err,foundType){
        if (err) return res.negotiate(err);
        else return res.view('admin/type',{foundType})
      })
  },

  addtype: (req,res) => {
    if (!req.isSocket) {
      return res.badRequest();
    }
    let params = req.allParams();
    console.log(params);
    Type.create(params).exec(function(err,result){
      sails.sockets.blast('add/type',{msg:result})
    })
  }

};

