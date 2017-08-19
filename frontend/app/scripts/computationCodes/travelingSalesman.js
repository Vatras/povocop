/**
 * Created by Pjesek on 01.08.2017.
 */
var configuration;
function main(inputData){

  console.log('inputData.val1,inputData.val2',inputData.val1,inputData.val2);
  var i=0;
  while(i<1000000000){
    i+=1
  }
  self.postMessage({
    results:{
      // "points_inside": points_inside,
      // "points_total" : points_total
    }
  });

}
function onConfig(config){
  console.log(config)
}
self.newConfig = function(data){
  onConfig = onConfig || function(){}
  onConfig(data.config)
  //setInterval(function(){main(data);})
}

self.ondata = function(data){
  main =  main || function(){}
  main(data.inputData);
}
function verify(result,inputData){
  var i=0;
  while(i<3000000000){
    i+=1
  }
  return true;
}
self.onverify = function(data){
  var inputData = data.inputData ?
    JSON.parse(data.inputData) : undefined
  var status = verify(data.result,inputData);
  self.postMessage({
    type : 'verification',
    data : data,
    status : status
  });
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
