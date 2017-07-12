var socket = io('centos:9000');

socket.on('news',function(a,b){
  console.log(a,b)
})
