$(function() {
  var socket = io.sails.connect();
  socket.get('/socket');

  $('#myCarousel1').carousel('pause',{
    interval: 4000
  });


  $('.multi-slide .item').each(function(){
    var next = $(this).next();
    if (!next.length) {
      next = $(this).siblings(':first');
    }
    next.children(':first-child').clone().appendTo($(this));

    for (var i=0;i<4;i++) {
      next=next.next();
      if (!next.length) {
        next = $(this).siblings(':first');
      }
      next.children(':first-child').clone().appendTo($(this));
    }
  });


  $('tr.tr-product a.add-to-cart').each(function(){
    $(this).click(function(){
      $(this).unbind("click");
      var findImg = $(this).closest('tr.tr-product').find('img');
      var cart = $('.fa-shopping-cart');

      var imgclone = findImg.clone()
        .offset({
          top: findImg.offset().top,
          left: findImg.offset().left
        })
        .css({
          'opacity': '0.5',
          'position': 'absolute',
          'height': '100px',
          'width': '160px',
          'z-index': '100'
        })
        .appendTo($('body'))
        .animate({
          'top': cart.offset().top + 10,
          'left': cart.offset().left + 10,
          'width': 30,
          'height': 18
        }, 1000);

      imgclone.animate({
        'width': 0,
        'height': 0
      }, function () {
        $(this).detach()
      });


      var setID = $(this).closest('tr.tr-product').find('td.td-id').text();
      var setNAME = $(this).closest('tr.tr-product').find('td.card-name').text();
      var setIMG = $(this).closest('tr.tr-product').find('img').attr("src");
      var setTYPE = $(this).closest('tr.tr-product').find('td.card-type').text();
      var setPRICE = parseFloat($(this).closest('tr.tr-product').find('td.product-price').text().replace('$',''));
      $('#cartModal div.modal-body').append('<div class="media"><span class="sr-only have-cart">'+setID+'</span>' +
        '<div class="media-left"><img src="'+setIMG+'" class="media-object" style="width:80px"></div>' +
        '<div class="media-body"><h5 class="media-heading">'+setNAME+'</h5><p><span class="badge">'+setTYPE+'</span></p></div>' +
        '<div class="media-right"><h5>$'+setPRICE+'</h5></div></div>');
      $('p.no-item').addClass('sr-only');

      let cartData = {
        id :  $(this).closest('tr.tr-product').find('td.td-id').text(),
        name: $(this).closest('tr.tr-product').find('td.card-name').text(),
        img : $(this).closest('tr.tr-product').find('img').attr("src"),
        type : $(this).closest('tr.tr-product').find('td.card-type').text(),
        value : parseFloat($(this).closest('tr.tr-product').find('td.product-value').text().replace('$','')),
        price : parseFloat($(this).closest('tr.tr-product').find('td.product-price').text().replace('$','')),
        save : parseFloat($(this).closest('tr.tr-product').find('td.product-save').text().replace('%',''))
      };
      console.log(cartData);
      socket.post('/cart/add',cartData);

      $(this).closest('tr.tr-product').addClass('cart-added');
      $(this).attr('disabled','disabled');
    })
  });

  socket.on('add-to-cart',function(recieve){
    let findNumber = parseInt($('span.total-cart').text())+1;
    $('span.total-cart').text(findNumber);
    if ($('#cartModal .modal-footer a.view-cart').text() !== 'Checkout') {
      $('#cartModal .modal-footer').append('<a href="/cart/view?sid='+recieve.msg.sid+'" type="button" class="view-cart btn">Checkout</a>');
      $('#cartModal .modal-footer').find('button.btn').addClass('sr-only');
    }
  });

  $('a.close.del-item').each(function(){
    $(this).click(function(){
      alert('ok');
      // let data = $(this).attr('dataname');
      // socket.get('/cart/remove?'+data);
    })
  });

  $('.view-cart-item a.remove-item').each(function(){
    $(this).click(function(){
      let data = {
        id : $(this).find('span.remove-item-id').text(),
        sessionId : window.location.search.split('?sid=')[1]
      };
      socket.get('/cart/remove',data)
    })
  });

  socket.on('remove/cart',function(){
    window.location.reload();
  });

  $('a.next-process').click(function(){

    var codeto = $('div.find-email span.set-email').text();
    if (codeto == 'no-email') {
      $('#setEmailModal').modal('show');
    } else {
      $('div.se-pre-con').removeClass('sr-only');
    var jsonData = [];
    var totalData = parseFloat($('td.td-total').text().replace('$',''));
    let sessionId = window.location.search.split('?sid=')[1];

    $('div.view-cart-item').each(function(){
      var eachData = {
        name : $(this).find('span.cart-name').text(),
        sku : $(this).find('span.cart-pid').text(),
        price : parseFloat($(this).find('h3.cart-item-price').text().replace('$','')),
        currency : 'USD',
        quantity : 1

      };
      jsonData.push(eachData);
    });
    var data = {totalData,jsonData,sessionId,codeto};
    socket.post('/payment/test',data);
    }
  });

  let subTotal = [];
  $('#checkout-page .media .media-right h4').each(function(){
    let priceItem = parseFloat($(this).text().replace('$',''));
    subTotal.push(priceItem);
  });
  let subtotal = subTotal.reduce((a,b) => a+b,0);
  let taxFee = parseFloat($('#checkout-page td.td-tax').text().replace('$',''));
  let shippingFee = parseFloat($('#checkout-page td.td-shipping').text().replace('$',''));
  let amount = subtotal - taxFee - shippingFee;
  $('#checkout-page tbody td.td-subtotal').text('$'+subtotal);
  $('#checkout-page tfoot td.td-total').text('$'+amount);

  $('a.btn-checkout-page').click(function(){
    let sessionId = window.location.search.split('?sid=')[1];
    let itemData = [];
    $('#checkout-page .media').each(function(){
      var eachData = {
        "name": $(this).find('h4.co-cart-name').text(),
        "sku": $(this).find('span.co-cart-pid').text(),
        "price": parseFloat($(this).find('h4.co-cart-price').text().replace('$','')).toFixed(2),
        "currency": "USD",
        "quantity": 1,
      };
      itemData.push(eachData);
    });
    var jsonData = [{
      "item_list": {
        "items": itemData
      },
      "amount": {
        "currency": "USD",
        "total": parseFloat($('#checkout-page tfoot td.td-total').text().replace('$','')).toFixed(2)
      },
    }];
    let customerEmail = $('#checkout-page input#email').val();
    let customerData = {
      "payment_method": "credit_card",
      "funding_instruments": [{
        "credit_card": {
          "type": "visa",
          "number": "4032035278890983",
          "expire_month": "12",
          "expire_year": "2021",
          "cvv2": "874",
          "first_name": $('#checkout-page input#firstname').val(),
          "last_name": $('#checkout-page input#lastname').val(),
          "billing_address": {
            "line1": $('#checkout-page input#address').val(),
            "city": $('#checkout-page input#city').val(),
            "state": $('#checkout-page input#state').val(),
            "postal_code": $('#checkout-page input#postalcode').val(),
            "country_code": "US"
          }
        }
      }],
    };
    // let totalAmount = parseFloat($('#checkout-page tfoot td.td-total').text().replace('$','')).toFixed(2);
    let step = "payment_method";
    let data = {sessionId,jsonData,customerEmail,customerData,step};

    socket.post('/cart/checkout',data);
  });

  socket.on('create/checkout',function(recieve){
    window.location = '/cart/checkout?sid='+recieve.msg.sid+'&step=payment_confirm'
  });

  $('a.btn-checkout-complete').click(function(){
    $('div.se-pre-con').removeClass('sr-only');
    let sid = window.location.search.split('?sid=')[1].split('&')[0];
    socket.post('/cart/complete',{sid:sid});
  });


  $('button.enter-email').click(function(){
    $("#setEmailModal").modal('hide');
    var foundEmail = $('#enter-email').val();
    $('div.find-email').html('<strong>Notice!</strong> We will send gift card code to email <span class="set-email">'+foundEmail+'</span>.');
  });

  socket.on('create/invoice',function(recieve){
    window.location = recieve.msg;
  });

  socket.on('payment/complete',function(recieve){
    window.location = '/payment/success?paymentId='+recieve.msg;
  });

  socket.on('checkout/step2',function(recieve){
    window.location = '/checkout?sid='+recieve.sid+'&invoice='+recieve.invoice+'step=payment_method';
  });

  socket.on('update/balance',function(recieve){
    $('#user-page div#user-balance-id-'+recieve.msg[0].id).hide('fast');
    $('#user-page div#user-balance-id-'+recieve.msg[0].id).html('$'+recieve.msg[0].balance);
    $('#user-page div#user-balance-id-'+recieve.msg[0].id).show('fast');

  });

  $(document).ready(function(){
    $('.col-search input').keyup(function(){
        var putvalue = $(this).val();
        if (putvalue.length > 0 ) {

          socket.post('/giftcard/search',{key:putvalue});
        } else if (putvalue.length == 0) {

          $('div.result-live-search').html('<div class="sr-only"></div>')
        }
    });

    $('#cartModal span.have-cart').each(function(){
      var productID = $(this).text();
      if (productID !== 'null') {
        $('tr#product-'+productID).addClass('cart-added');
        $('tr#product-'+productID+' a').unbind("click");
      }
    });

    // var total_price = [];
    // $('td.product-price').each(function(){
    //   var oneprice = parseFloat($(this).text().replace('$',''));
    //   total_price.push(oneprice);
    // });
    // var total = total_price.reduce((a,b) => a+b,0);
    // $('div.total strong').text(total);
    let totalItem = [];
    $('#cartModal .media .media-right h4').each(function(){
      let priceItem = parseFloat($(this).text().replace('$',''));
      totalItem.push(priceItem);
    });
    var calTotal = totalItem.reduce((a,b) => a+b,0);
    $('#cartModal .modal-footer span.total-value strong').html('$'+calTotal);

    $('td.giftcard-detail').each(function(){
      var $this = $(this);
      var t = $this.text();
      $this.html(t.replace('&lt','<').replace('&gt', '>').replace(/\\r\\n/g, '<br />').replace(new RegExp("\\\\", "g"), ""));
    });

    $('#list-giftcard').DataTable({
      "language": {
        "search": "Live search brand (Autocomplete) "
      },
      "lengthMenu": [[5, -1], [5, "All"]]
    });
    $('#list-giftcard_filter input').keyup(function(){
      if ($(this).val().length == 1) {
        $('table.dataTable').addClass('show-table');
      }
      if ($(this).val().length == 0) {
        $('table.dataTable').removeClass('show-table');
      }
    });

    if (window.location.pathname == '/payment/confirm') {
      $('a.checkout-button').addClass('sr-only');
    }

    if (window.location.pathname == '/user/sell') {
      var findUrl = window.location.href.split('&type=');
      var findType = findUrl[1];
      var findId = findUrl[0].split('id=')[1];
      $('#giftcard').val(findType);
      $('#cid').val(findId);

      $('#value').keyup(function(){
        $('#price').val($('#value').val());
        var realsave = $('#value').val() - $('#price').val();
        var persensave = realsave*100/$('#value').val();
        $('#save').val(persensave);
      });

      $('#price').keyup(function(){
        var realsave = $('#value').val() - $('#price').val();
        var persensave = realsave*100/$('#value').val();
        $('#save').val(persensave.toFixed(1));
      })
    } else if (window.location.pathname == '/cart/view') {
      let total_price = [];
      let total_numItem = [];
      $('h3.cart-item-price').each(function(){
        var oneprice = parseFloat($(this).text().replace('$',''));
        total_price.push(oneprice);
        total_numItem.push(1);
      });
      let total = total_price.reduce((a,b) => a+b,0);
      let numItem = total_numItem.reduce((a,b) => a+b,0);
      $('div.cart-detail-side h2 span').text('('+numItem+' item)');
      $('td.td-total').text('$'+total);

      let total_summary = [];
      $('div.summary-side td.calsum').each(function(){
        var onecalsum = parseFloat($(this).text().replace('$',''));
        total_summary.push(onecalsum);
      });
      let summary = total_summary.reduce((a,b) => a+b,0);
      $('.summary-side .td-total').text('$'+summary);

      let total_value = [];
      $('div.view-cart-item span strong').each(function(){
        var onevalue = parseFloat($(this).text().replace('$',''));
        total_value.push(onevalue);
      });
      let value = total_value.reduce((a,b) => a+b,0);
      let saving = value - total;
      $('.summary-side .td-saving').text('$'+parseFloat(saving).toFixed(2));
    }



    $('#myCarousel1 .item:first').addClass('active');
    // var getHeight = $( window ).height()-80;
    // $('.sidenav').css('height',getHeight);

    $('.menu-button .aright').click(function(){
      $('.sidenav').addClass('menu-active');
      $('.aright').addClass('sr-only');
      $('.aleft').removeClass('sr-only');
    });

    $('.menu-button .aleft').click(function(){
      $('.sidenav').removeClass('menu-active');
      $('.aleft').addClass('sr-only');
      $('.aright').removeClass('sr-only');
    });


    var checkPath = window.location.pathname;
    if (checkPath.match(/admin\/brands/gi)) {

      $('.filter-price input').click(function(){
        var filterPrice = $('#filter_price').val();
        var filterPriceVal = $(this).val();
        $('#filter_price').val(filterPrice+','+filterPriceVal);
      });

      CKEDITOR.replace('detail');
      CKEDITOR.replace('term');
    }

    if (checkPath.match(/admin\/invoice/gi)) {
      $('#table-invoice').DataTable({
        "language": {
          "search": "Live search"
        },
        "lengthMenu": [[25,100,-1], [25,100, "All"]]
      });

      $('td.invoice-date').each(function(){
        var mmformat = $(this).text();
        $(this).text(moment(mmformat).format('YYYY/MM/DD'));
      })
    }

    if (checkPath.match('/brand/edit')){
      var checkCardType = $('input.card-type').val();
      $('input#type-'+checkCardType).attr('checked','checked')
    }

    if (checkPath.match(/user\/sell/gi)) {
      $('#giftcard').val($('#giftcard').val().replace('%20',' '));
    }

    $('a.user-list').click(function(){
      $(this).find('i.fa-chevron-right').toggleClass('rotated');
    });


    $('fieldset .form-control').each(function(){
      $(this).focus(function(){
        $(this).keyup(function(){
          $(this).closest('fieldset').find('label').css('margin-top','-42px');
          $(this).closest('fieldset').find('label').css('font-size','12px');
          $(this).css('padding-top','26px');
        })
        // if ($(this).val() !== '' ) {
        //   $(this).closest('fieldset').find('label').css('margin-top','-42px');
        //   $(this).closest('fieldset').find('label').css('font-size','12px');
        // }

      });

      $(this).focusout(function(){
        if ($(this).val() == '' ) {
          $(this).closest('fieldset').find('label').css('margin-top','-30px');
          $(this).closest('fieldset').find('label').css('font-size','13px');
          $(this).css('padding-top','10px');
        }

      })
    })
  });

  socket.on('live/search',function(recieve){
    var inputKeyWidth = $('.col-search div.input-key').width();
    if (recieve.msg.length == 0) {

      // $('div.result-live-search').html('<div class="sr-only"></div>')
    } else {

      $('div.result-live-search').html('<div class="show-result-search" style="position:absolute"></div>');
    for (i=0;i<recieve.msg.length;i++){

      $('div.result-live-search .show-result-search').append('<a href="/giftcard/view/'+recieve.msg[i].id+'">' +
        '<div style="width:'+inputKeyWidth+'px" class="result-item">' +
        '<img src="'+recieve.msg[i].thumbnail+'" width="80"><h4>'+recieve.msg[i].name+'</h4>' +
        '<span class="pull-right">Save up to '+recieve.msg[i].save+'%</span>' +
        '</div></a>')
    }
    }
  });

  //USER MANAGEMENT
  // Khi submit script này sẽ chuyển data sang dạng socket và gửi đến server
  // UserController sẽ xử lý phần tiếp theo
  $('#login').submit(function (e) {
    console.log('gọi hàm submit');
    e.preventDefault();
    var data = $('#login').serialize();
    socket.get('/user/login?' + data);
  });
  // Khi client nhận thông báo login-success từ server sẽ chuyển user sang trang home
  socket.on('user/login-success', function(re) {
    window.location = re.msg;
  });

  $('#register').submit(function (r) {
    console.log('gọi hàm submit');
    r.preventDefault();
    var data = $('#register').serialize();
    socket.get('/user/register?' + data);
  });
  socket.on('user/registered', function() {
    $('#regModal p').text("Đăng ký thành công, hãy đăng nhập");
    $('#regModal').modal();
  });
  socket.on('user/exists', function() {
    $('#regModal p').text("Đã có người đăng ký tài khoản này");
    $('#regModal').modal();
  });

  // x-editable
  $.fn.editable.defaults.mode = 'inline';
  user_id = $(".user-info [static-userdata=id]").text();
  $('.user-info [userdata]').each(function(i,element){
    var keyToUpdate = $(element).attr('userdata');
    var title = ($(element).attr('title')) ? $(element).attr('title') : 'Vui lòng nhập để sửa thông tin';

    $(element).editable({
      type: 'text',
      url: '/user/' + user_id,
      pk: '',
      params: function(params) {
        var updateText = params['value'];
        delete params['pk'];
        delete params['name'];
        delete params['value'];

        params[keyToUpdate] = updateText;

        return params;
      }, title: title, ajaxOptions: {
        type: 'put'
      }
    });
  });




  $('#sell-giftcard-form').submit(function (sc) {
    sc.preventDefault();
    var data = $('#sell-giftcard-form').serialize();
    socket.get('/user/sellgc?'+data);
  });

  socket.on('sell/new',function(){
    window.location.reload();
  });

  // Xóa multi ID
  $("#removeid").click(function(event){
    event.preventDefault();
    var searchIDs = $("table input[type=checkbox]:checked").map(function() {
      return this.value;
    }).get().join();
    console.log("admin/userdel?id="+searchIDs);
    socket.get("/admin/userdel?id="+searchIDs)
  });

  //END USER MANAGEMENT
  // $('#uploadForm').submit(function(u){
  //
  //
  // });
  socket.on('upload/thumbnail',function(data){
    $('#thumbnailModal').modal('hide');
    $('#thumbInput').val(data.img);
  });

});


// Image Upload with preview
function showMyImage(fileInput) {
  var files = fileInput.files;
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var imageType = /image.*/;
    if (!file.type.match(imageType)) {
      continue;
    }
    var img=document.getElementById("thumbnail");
    img.file = file;
    var reader = new FileReader();
    reader.onload = (function(aImg) {
      return function(e) {
        aImg.src = e.target.result;
      };
    })(img);
    reader.readAsDataURL(file);
  }
}

function goBack() {
  window.history.back();
}

function printMyPage() {
  window.print();
}

