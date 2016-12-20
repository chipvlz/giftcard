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
    Type.find().exec(function(err,foundType) {
      Giftcard.find().exec(function (err, foundGiftcard) {
        if (err) return res.negotiate(err);
        else {
          console.log(foundGiftcard);
          return res.view('admin/giftcard', {foundGiftcard,foundType});
        }
      })
    })
  },

  agift: (req,res) => {
    if (!req.isSocket) {
      return res.badRequest();
    }
    let params = req.allParams();
    console.log(params);
    Giftcard.create(params).exec(function(err,result){
      if (err) return res.negotiate(err);
      else {

      }
      sails.sockets.blast('add/giftcard',{msg:result})
    })
  },

  product: (req,res) => {
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

  atype: (req,res) => {
    if (!req.isSocket) {
      return res.badRequest();
    }
    let params = req.allParams();
    console.log(params);
    Type.create(params).exec(function(err,result){
      sails.sockets.blast('add/type',{msg:result})
    })
  },

  dtype: (req,res) => {
    if (!req.isSocket) {
      return res.badRequest();
    }
    let params = req.allParams();
    Type.destroy({id:params.id}).exec(function(err){
      sails.sockets.blast('del/type',{msg:'Deleted Successfull'})
    })
  },

  etype: (req,res) => {
    if (!req.isSocket) {
      return res.badRequest();
    }
    let params = req.allParams();
    Type.update({id:params.id},params).exec(function(err,result){
      sails.sockets.blast('edit/type',{msg:result})
    })
  }

};

