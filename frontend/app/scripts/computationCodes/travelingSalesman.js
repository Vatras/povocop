/**
 * Created by Pjesek on 01.08.2017.
 */
var config;
function main(inputDataa){

  var itEnd = config.iterationCount;

  self.postMessage({
    results:{
      "points_inside": points_inside,
      "points_total" : points_total
    }
  });

}

self.onconfig = function(data){
  config = data.config;
  //setInterval(function(){main(data);})
}

self.ondata = function(data){

}

self.onmessage = function(e) {
  var funName = e.data.msgType === 'inputData' ? 'ondata' : 'onconfig';
  self[funName](e.data)
}

// function (start,end,modulo){
//   var iterator=0
//   var it2=0;
//   while(start+iterator < end){
//     for(var it2=1;it2<100;it2++)
//     {dataSet.push({val1: (start+iterator),
//       val2: it2
//     })}
//     iterator+=2;
//   }
// }
