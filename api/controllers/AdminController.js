/**
 * AdminController
 * @Owner       :: Khanh Tran
 * @description :: Server-side logic for managing admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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
      Giftcard.find().populate('type').exec(function (err, foundGiftcard) {
        if (err) return res.negotiate(err);
        else {
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
    Giftcard.create(params).exec(function(err,result){
      if (err) return res.negotiate(err);
      else {
        sails.sockets.blast('add/giftcard',{msg:result})
      }

    })
  },

  dgift: (req,res) => {
    if (!req.isSocket) {
      return res.badRequest();
    }
    let params = req.allParams();
    Giftcard.destroy({id:params.id}).exec(function(err){
      sails.sockets.blast('del/gift',{msg:'Deleted Successfull'})
    })
  },

  cardedit: (req,res) => {
    let params = req.allParams();
    Type.find().exec(function(err,foundType) {
      Giftcard.findOne({id: params.id}).exec(function (err, foundCard) {
        return res.view('admin/edit_giftcard', {foundCard,foundType})
      })
    })
  },


  egift: (req,res) => {
    if (!req.isSocket) {
      return res.badRequest();
    }
    let params = req.allParams();
    Giftcard.update({id:params.id},params).exec(function(err,result){
      sails.sockets.blast('edit/gift',{msg:result})
    })
  },

  product: (req,res) => {
    Product.find().populate('cid').populate('owner').exec(function(err,foundProduct){
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
  },

  user: (req,res) => {
    User.find().populate('groupid').exec(function(err,foundUser){
      if (err) return res.negotiate(err);
      else return res.view('admin/user',{foundUser})
    })
  },

  userid: (req,res) => {
    let params = req.allParams();
    User.findOne({id:params.id}).populate('products').exec(function(err,foundUser){
      res.view('admin/userview',{foundUser})
    })
  },

  usergroup: (req,res) => {
    Usergroup.find().exec(function(err,foundUsergroup){
      if (err) return res.negotiate(err);
      else return res.view('admin/usergroup',{foundUsergroup})
    })
  },

  invoice: (req,res) => {
    Invoice.find().exec(function(err,foundInvoice){
      if (err) return res.negotiate(err);
      else {
        return res.view('admin/invoice',{foundInvoice});
      }
    })
  },
  delinvoice: (req,res) => {
    let params = req.allParams();
    sails.sockets.join(req,'del/'+params.invoice);
    Invoice.destroy({invoice:params.invoice}).exec(function(err,result){
      console.log(result);
      sails.sockets.broadcast('del/'+params.invoice,'del/invoice',{msg:result})
    })
  }

};

