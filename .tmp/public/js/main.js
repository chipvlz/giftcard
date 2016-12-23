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

  $(document).ready(function(){
    $('#myCarousel1 .item:first').addClass('active');
    var getHeight = $( window ).height()-80;
    $('.sidenav').css('height',getHeight);

    var checkPath = window.location.pathname;
    if (checkPath.match(/giftcard\//gi)) {
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

