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
  createTable(dataSet,'inputDataTable')
}
window.onload= function(){
  // openTab(event, 'addData')
  document.getElementsByClassName('initial')[0].click();
}

function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;
  if(tabName=='browseData'){
    getInputData();
  }
  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}
function createTable(data,tableName) {
  $('#TABLENAME_wrapper'.replace('TABLENAME',tableName)).replaceWith('<table id="TABLENAME" class="display" width="100%"></table>'.replace('TABLENAME',tableName))
  $('#TABLENAME'.replace('TABLENAME',tableName)).DataTable( {
    data: data,
    columns: [
      { title: "No." },
      { title: "Value" },
      { title: "Assigned" }
    ]
  } );
}
function deleteInputData() {
  var appName = window.location.pathname.split('/')[3]
  var requestData = {
    url: '/data/'+ appName,
    method: 'DELETE'
  }
  ajaxRequest(requestData,function(result) {
    console.log('success')
    createTable([],'browseDataTable')
  })
}
function getInputData() {
  var appName = window.location.pathname.split('/')[3]
  var requestData = {
    url: "/data/"+ appName,
    method: 'GET'
  }
  ajaxRequest(requestData,function (data) {
        console.log(data);
        var parsedData = data.map(function(val,idx){return [idx,JSON.stringify(val.data),val.assigned]});
        createTable(parsedData,'browseDataTable')
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
  var requestData = {
    url: "/data/"+ appName,
    method: 'POST',
    data: {"data" : inputData}
  }
  ajaxRequest(requestData);
}