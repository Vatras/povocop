function calc_pi(inputData){

  var itEnd = inputData.interationCount
  var start = new Date().getTime();
  var radius=1;
  var r = radius;
  var points_total = 0;
  var points_inside = 0;

  while (1) {
    points_total++;

    var x = Math.random() * r * 2 - r;
    var y = Math.random() * r * 2 - r;
    if (Math.pow(x, 2) + Math.pow(y, 2) < Math.pow(r, 2))
      points_inside++;

    if (points_total % itEnd == 0)
    {
      if (points_total % itEnd == 0)
      {
        var diff = (new Date().getTime() - start)
        console.log(diff,points_inside + "/" + points_total + " pi == " + (4 * points_inside / points_total));
        break;
      }
    }
  }

  self.postMessage({
    results:{
      "points_inside": points_inside,
      "points_total" : points_total
    }
  });
}


self.onmessage = function(e) {
  calc_pi(e.data);
}
