(function() {
  var startTime=new Date().getTime()
  $('#thanks').css('display','none')
  if(localStorage.getItem('timestamp')){
    $('form').css('display','none')
    $('#thanks').css('display','block')
  }
 $('#submitBtn').on('click',function(){
   var totalTime=new Date().getTime()-startTime;
   $('#timeInput').val(totalTime);

   $('#singleThreadSpeed').val(localStorage.getItem('singleThreadSpeed')||'');
   $('#cpuNum').val(localStorage.getItem('cpuNumber')||'');
   $('#emittedResults').val(emittedResults);

   $.ajax ({
     url: 'http://localhost:9000/survey',
     type: 'POST',
     data: JSON.stringify({'data': $('form').serialize()}),
     dataType: "json",
     contentType: "application/json; charset=utf-8",
     success: function(response){
       localStorage.setItem('timestamp', new Date().getTime()+Math.random())
       $('form').css('display','none')
       $('#thanks').css('display','block')
     },
     error:function(err){
       alert('error!',err)
     }
   });
 })
})();
