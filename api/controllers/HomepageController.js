/**
 * HomepageController
 * @Owner       :: Khanh Tran
 * @description :: Server-side logic for managing homepages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  index: (req,res) => {
    let sampleDate = (new Date()).toString();
    let data = {
      currentDate: sampleDate,
      textAdmin: 'Khánh Trần',
      textDesc: '',
      textVersion: '1.0.1'
    };
    Giftcard.find().exec(function(err,foundCard){
      return res.view("homepage",{foundCard});
    });

  }
};

