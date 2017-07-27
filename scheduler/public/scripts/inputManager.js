var dataSet = [];
$('#generateBtn').on('click',generateData);
$('#saveBtn').on('click',saveInputData);
$('#getDataBtn').on('click',getInputData);
$('#deleteDataBtn').on('click',deleteInputData);
function generateData(){
  dataSet = [];
  var startRange = $('#startRangeInput').val() || 0
  startRange = parseInt(startRange)
  var endRange = $('#endRangeInput').val() || 0
  endRange = parseInt(endRange)
  var modulo = $('#moduloInput').val() || 1
  modulo = parseInt(modulo)
  var idx = 0;
  for(var i=startRange;i<endRange;i+=modulo){
    dataSet.push([idx++,i,false])
  }
  createTable()
}
function createTable() {
  $('#inputDataTable_wrapper').replaceWith('<table id="inputDataTable" class="display" width="100%"></table>')
  $('#inputDataTable').DataTable( {
    data: dataSet,
    columns: [
      { title: "No." },
      { title: "Value" },
      { title: "Assigned" }
    ]
  } );
}
function deleteInputData() {
  var appname = window.location.pathname.split('/')[3]
  $.ajax({
    url: '/data/'+ appname,
    type: 'DELETE',
    success: function(result) {
      // Do something with the result
    }
  });
}
function getInputData() {
  var appname = window.location.pathname.split('/')[3]
  $.get("/data/"+ appname, function (data, status) {

  });
}
function parseInputDate(dataSet){
  return dataSet.map(function(item){
    return {data: {val1: item[1]}}
  })
}
function saveInputData() {
  var appName = window.location.pathname.split('/')[3]
  var inputData = parseInputDate(dataSet)
  $.post("/data/"+ appName,
      {"data" : inputData} ,function (data, status) {

  },"json");
}