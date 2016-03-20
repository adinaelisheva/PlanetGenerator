(function() {

var app = angular.module('index', []);
app.controller('ctrl', ['$scope', function($scope) {    
    var p = new Planet();
    
    //add some stuff for outputting
    p.printableType = p.type === 1 ? 'Gaseous' : 'Terrestrial';
    
    //convert to string to count the number of decimals
    var v = Math.round(p.getVolume());
    p.volume = v;
    var numChars = v.toString().length;
    var order = Math.pow(10,numChars-3);
    $scope.showVolume = (Math.round(v/order)/100);
    $scope.volumeExp = numChars-1;
    
    if(p.type === 1 && p.population > 0) {
      p.population += ' (on moons)';
    }
    
    p.density = Math.round(p.density*100) / 100;
    
    p.radius = p.radius.toLocaleString();
    
    var earthVol = 1.08321e12;
    $scope.earths = Math.round(p.volume * 100 / earthVol) / 100;
    
    $scope.planet = p;
    
    var canvas = $('canvas#planet')[0];
    p.drawPlanetImage(canvas);
    
    //add a black background to the planet
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "#000000";
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    //edit the composition to be good
    $scope.printableComposition = {};
    var keys = Object.keys(p.composition);
    for(var i = 0; i < keys.length; i++) {
      var item = keys[i];
      if(item === 'silicate' || item === 'gas core') {
        continue;
      }
      $scope.printableComposition[item] = p.composition[item];
    }
    
}]); 


})();