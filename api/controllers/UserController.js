/**
 * UserController
 * @Owner       :: Khanh Tran
 * @description :: Server-side loXử lý mọi thông tin liên quan đến user
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  login: (req, res) => {
    //Kiểm tra xem data gửi đến từ client (main.js xử lý) có đúng là socket không?
    if (!req.isSocket) {return res.badRequest();}

    let params = req.allParams();
    console.log(params);
    User.login(params.email, params.password).then((result) => {

      req.session.user_id = result.id; // Store id vào sess user_id
      req.session.user = result; // store hết user data vào object user trong session

      let session_id = req.signedCookies['sails.sid'];


      sails.sockets.join(req, 'logged'); // Đưa user vừa đăng nhập vào room Logged
      sails.sockets.join(req, session_id); // Đưa user vừa đăng nhập vào room của chính bản thân user
      sails.sockets.broadcast(session_id, 'user/login-success', { msg:params.referer, all_session_data: req.session});

      delete result.password;
      res.json(200, {result});

    }).catch((err) => {
      res.json(500, {"báo lỗi": err})
    });
  },
  //Xóa toàn bộ session của user khi logout
  logout: (req, res) => {
    req.session.destroy(function() {
      res.redirect('/home');
    });
  },
  register: (req, res) => {
    //Kiểm tra xem data gửi đến từ client (main.js xử lý) có đúng là socket không?
    if (!req.isSocket) {return res.badRequest();}

    let params = req.allParams();
    User.findOne({email:params.email}).exec(function(err,record) {
      if (err) {
        return res.negotiate(err);
      }
      if (record) {
        sails.sockets.join(req, params.email);
        sails.sockets.broadcast(params.email,'user/exists');
        return res.status(500,'User already exists!');
      } else {
        User.create({email:params.email,password: params.password,name: params.name,birthday:params.birthday}).exec(function(err,result) {
          if (err) { return res.serverError(err); }
          sails.sockets.join(req, params.email);
          sails.sockets.broadcast(params.email,'user/registered');
          return res.ok();
        })
      }
    });
  },

  view: (req,res) => {
    let params = req.allParams();
    User.findOne({id:req.session.user.id}).populate('products')
      .exec(function(err,foundUser){
        console.log(foundUser);
        return res.view('user/index',{foundUser})
      })
  },

  balance: (req,res) => {
    User.findOne({id:req.session.user.id}).populate('products',{status:'Sold'})
      .exec(function(err,foundUser){
        console.log(foundUser);
        return res.view('user/balance',{foundUser})
      })
  },

  sell: (req,res) => {
    let params = req.allParams();
    Giftcard.find().populate('type').exec(function(err,foundGiftcard){
      res.view('user/sell',{foundGiftcard})
    })
  },

  sellgc: (req,res) => {
    let params = req.allParams();
    console.log('params',params);
    sails.sockets.join(req,params.code);
    Giftcard.findOne({id:params.cid}).exec(function(err,foundCard){
      if(foundCard && params.save > foundCard.save) {
        Giftcard.update({id:params.cid},{save:params.save}).exec(function(err,addok){
          console.log('update save',addok)
        })
      }
      Product.create(params).exec(function(err,result){
      console.log(result);
      let socketdata = {
        name: foundCard.name,
        type: foundCard.type,
        value: result.value,
        price: result.price,
        save: result.save,
        date: result.createdAt
      };
      sails.sockets.broadcast(params.code,'sell/new');
      sails.sockets.blast('new/giftcard',{msg:socketdata})
      })
    })
  },

  allusers: (req, res) => {
    User.find(function (err, users) {
      res.view('admin/users',{users})
    })
  },

  userid: (req,res) => {
    User.findOne({id:req.session.user.id}).exec(function(err,userdata){
      res.view('user/info',{userdata});
    })
  },

  gift: (req,res) => {
    User.findOne({id:req.session.user.id}).exec(function(err,foundUser){
      if (foundUser) {
        Belong.find({bid:foundUser.email}).populate('pid').exec(function(err,foundBelong){

          res.view('user/giftcode',{foundBelong});
        })
      }
    });

  }
};

