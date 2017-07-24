var dataSet = [];
$('#generateBtn').on('click',generateData);
$('#saveBtn').on('click',saveInputData);
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

function getInputData() {
  var appname = window.location.pathname.split('/')[2]
  $.get("inputdata/"+ appname, function (data, status) {

  });
}
function parseInputDate(dataSet){
  return dataSet.map(function(item){
    return {data: {val1: item[1]}}
  })
}
function saveInputData() {
  var appname = window.location.pathname.split('/')[2]
  var inputData = parseInputDate(dataSet)
  $.post("/inputdata/"+ appname,
      {"data" : inputData} ,function (data, status) {

  },"json");
}