var configuration;
function main(){

  var itEnd = configuration.iterationCount;
  var start = new Date().getTime();
  var radius=1;
  var r = radius;
  var points_total = 0;
  var points_inside = 0;

  while (1) {
    points_total++;

    var x = Math.random() * r * 2 - r;
    var y = Math.random() * r * 2 - r;
    if (parseFloat((y * y + x*x).toFixed(15))  < parseFloat(r * r).toFixed(15))
      points_inside++;

    if (points_total == itEnd)
    {

      var diff = (new Date().getTime() - start)
      console.log(diff,points_inside + "/" + points_total + " pi == " + (4 * points_inside / points_total));
      break;
    }
  }

  self.postMessage({
    results:{
      'points_inside': points_inside,
      'points_total' : points_total
    }
  });
  setTimeout(main);
}
function onConfig(config,lastResult){
  configuration = config;
  console.log(config)
  setTimeout(main);
}
function verify(result,inputData){

  return true;
}
