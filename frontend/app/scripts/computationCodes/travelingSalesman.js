/**
 * Created by Pjesek on 01.08.2017.
 */
var config;
function main(inputData){

  console.log('inputData.val1,inputData.val2',inputData.val1,inputData.val2);
  var i=0;
  while(i<10000000000){
    i+=1
  }
  self.postMessage({
    results:{
      // "points_inside": points_inside,
      // "points_total" : points_total
    }
  });

}

self.onconfig = function(data){
  config = data.config;
  //setInterval(function(){main(data);})
}

self.ondata = function(data){
  main(data.inputData);
}

self.onmessage = function(e) {
  var funName = e.data.msgType === 'inputData' ? 'ondata' : 'onconfig';
  self[funName](e.data)
}

// function (start,end,modulo){
//   var iterator=0;
//   while(start+iterator < end){
//     for(i=start;i<end;i++)
//       if(i!=iterator)
//         dataSet.push({val1: (start+iterator),
//           val2: (start+i)
//         })
//     iterator+=1;
//   }
// }
