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

  $('a[rel=popover]').popover({
    html: 'true',
    placement: 'bottom',
    content : function() {
      return $('#popover-content').html();
    }
  });

  $('tr.tr-product a.add-to-cart').each(function(){
    $(this).click(function(){
      $(this).unbind("click");
      // var setID = $(this).closest('tr.tr-product').find('td.td-id').text();
      // var setNAME = $(this).closest('tr.tr-product').find('td.card-name').text();
      // var setIMG = $(this).closest('tr.tr-product').find('img').attr("src");
      // var setTYPE = $(this).closest('tr.tr-product').find('td.card-type').text();
      // var setSAVE = parseFloat($(this).closest('tr.tr-product').find('td.product-save').text().replace('%',''));
      // var setVALUE = parseFloat($(this).closest('tr.tr-product').find('td.product-value').text().replace('$',''));
      // var setPRICE = parseFloat($(this).closest('tr.tr-product').find('td.product-price').text().replace('$',''));
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
      window.location.reload();
      // $('.popover-content').append('abcdef')
    })
  });

  $('a.close.del-item').each(function(){
    $(this).click(function(){
      alert('ok');
      // let data = $(this).attr('dataname');
      // socket.get('/cart/remove?'+data);
    })
  });

  $('tr.tr-cart a.remove-item').each(function(){
    $(this).click(function(){
      $(this).closest('tr.tr-cart').find('a.reloading').removeClass('sr-only');
      $(this).closest('tr.tr-cart').find('a.remove-item').addClass('sr-only');
      let data = {
        id : $(this).closest('tr.tr-cart').find('td.product-id').text(),
        sessionId : window.location.search.split('?sid=')[1]
      };
      socket.get('/cart/remove',data)
    })
  });

  socket.on('remove/cart',function(){
    window.location.reload();
  });

  $('a.next-process').click(function(){
    $(this).find('i.fa-spinner').removeClass('sr-only');
    $(this).find('i.fa-share-square-o').addClass('sr-only');
    var jsonData = [];
    var totalData = $('div.total strong').text();
    let sessionId = window.location.search.split('?sid=')[1];
    $('tr.tr-cart').each(function(){
      var eachData = {
        name : $(this).find('td.card-name').text(),
        sku : $(this).find('td.card-type').text(),
        price : parseFloat($(this).find('td.product-price').text().replace('$','')),
        currency : 'USD',
        quantity : 1
      };
      jsonData.push(eachData);
    });
    var data = {totalData,jsonData,sessionId};
    socket.post('/payment/test',data);
  });

  socket.on('create/invoice',function(recieve){
    window.location = '../payment/checkout?invoice='+recieve.msg;
  });

  // <div class="media alert alert-dismissable">
  //   <span class="sr-only have-cart"><%= cart.pid %></span>
  //   <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
  // <div class="media-left">
  //   <img src="<%= cart.image %>" class="media-object" style="width:80px">
  //   </div>
  //   <div class="media-body">
  //   <h4 class="media-heading"><%= cart.name %></h4>
  // <p><%= cart.type %></p>
  //   </div>
  //   <div class="media-right">
  // <%= cart.price %>
  //   </div>
  //   </div>

  $(document).ready(function(){


    $('#popover-content span.have-cart').each(function(){
      var productID = $(this).text();
      if (productID !== 'null') {
        $('tr#product-'+productID).addClass('cart-added');
        $('tr#product-'+productID+' a').unbind("click");
      }
    });


    // $("[data-toggle=popover]").popover();
    $('td.giftcard-detail').each(function(){
      var $this = $(this);
      var t = $this.text();
      $this.html(t.replace('&lt','<').replace('&gt', '>').replace(/\\r\\n/g, '<br />').replace(new RegExp("\\\\", "g"), ""));
    });

    $('#list-giftcard').DataTable({
      "language": {
        "search": "Live search gift card (Autocomplete) "
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
      var total_price = [];
      $('td.product-price').each(function(){
        var oneprice = parseFloat($(this).text().replace('$',''));
        total_price.push(oneprice);
      });
      var total = total_price.reduce((a,b) => a+b,0);
      $('div.total strong').text(total);
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
    if (checkPath.match(/admin\/giftcard/gi)) {
      CKEDITOR.replace('detail');
      CKEDITOR.replace('term');
    }
    if (checkPath.match('/giftcard/edit')){
      var checkCardType = $('input.card-type').val();
      $('input#type-'+checkCardType).attr('checked','checked')
    }

    $('a.user-list').click(function(){
      $(this).find('i.fa-chevron-right').toggleClass('rotated');
    });
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
  socket.on('user/login-success', function() {
    window.location = '/home';
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

  // Manager Gift Card Type
  $('#add-new-type').submit(function(t){
    t.preventDefault();
    var data = $('#add-new-type').serialize();
    socket.get('/admin/atype?'+data);
  });

  socket.on('add/type',function(recieve){
    location.reload();
  });

  $('#list-type table tbody tr').each(function(){
    $(this).click(function(){
      var searchID = $(this).find('td.td-id').text();
      var searchName = $(this).find('td.type-name').text();
      var searchDescription = $(this).find('td.type-description').text();
      $('#delTypeModal input[name=id]').val(searchID);
      $('#editTypeModal input[name=id]').val(searchID);
      $('#editTypeModal input[name=name]').val(searchName);
      $('#editTypeModal input[name=description]').val(searchDescription);

      // $('#edit-type-form').submit(function(){
    })
  });

  $('#del-type-form').submit(function (dt) {
    dt.preventDefault();
    var data = $('#del-type-form').serialize();
    socket.get('/admin/dtype?'+data);
    $('#delTypeModal').modal('hide');
  });

  socket.on('del/type',function(recieve){
    location.reload();
  });

  $('#edit-type-form').submit(function (et) {
    et.preventDefault();
    var data = $('#edit-type-form').serialize();
    socket.get('/admin/etype?'+data);
    $('#editTypeModal').modal('hide');
  });

  socket.on('edit/type',function(recieve){
    location.reload();
  });

  // Manager Gift Card
  $('#add-new-giftcard').submit(function(g){
    g.preventDefault();
    var data = $('#add-new-giftcard').serialize();
    socket.get('/admin/agift?'+data);
  });

  socket.on('add/giftcard',function(){
    location.reload();
  });

  $('#list-card table tbody tr').each(function(){
    $(this).click(function(){
      var searchID = $(this).find('td.td-id').text();
      var searchImage = $(this).find('td.card-image img').attr('src');
      var searchName = $(this).find('td.card-name').text();
      var searchType = $(this).find('td.card-type').text();
      var searchDescription = $(this).find('td.card-desc').text();
      var searchDetail = $(this).find('td.card-detail').text();
      var searchTerm = $(this).find('td.card-term').text();
      $('#delCardModal input[name=id]').val(searchID);
      $('#editCardModal input[name=id]').val(searchID);
      $('#editCardModal input[name=name]').val(searchName);
      $('#editCardModal h4 strong').html(searchName);
      $('#editCardModal img').attr('src',searchImage);
      $('#editCardModal textarea[name=description]').text(searchDescription);
      $('#editCardModal textarea[name=detail]').html(searchDetail);
      $('#editCardModal textarea[name=term]').html(searchTerm);


      // $('#edit-type-form').submit(function(){
    })
  });

  $('#del-card-form').submit(function (dc) {
    dc.preventDefault();
    var data = $('#del-card-form').serialize();
    socket.get('/admin/dgift?'+data);
    $('#delCardModal').modal('hide');
  });

  socket.on('del/gift',function(){
    location.reload();
  });

  $('#edit-card-form').submit(function (ec) {
    ec.preventDefault();
    var data = $('#edit-card-form').serialize();
    socket.get('/admin/egift?'+data);
    $('#editCardModal').modal('hide');
  });

  socket.on('edit/gift',function(){
    location.reload();
  });

  $('#sell-giftcard-form').submit(function (sc) {
    sc.preventDefault();
    var data = $('#sell-giftcard-form').serialize();
    socket.get('/user/sellgc?'+data);
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
