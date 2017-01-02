$(function() {
  var socket = io.sails.connect();
  socket.get('/socket');

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
  //end type


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

  //Realtime gift card sold
  socket.on('product/sold',function(get){
    console.log(get.data)
  })
});
