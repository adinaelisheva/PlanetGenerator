var Generator = function() {
    var rand = function(n) { return ~~(Math.random() * n); };

    var Types = { T: 0, G: 1 };

    var generatePlanetName = function() {
  
      var addRandChar = function(str, arr) {
        var x = rand(arr.length);
        str += arr[x];
        return str;
      }

      var vowels = ['a','a','e','e','i','i','o','o','u','ea','ie','ou','oi'];
      var consonants = ['b','d','f','g','k','l','m','n','p','r','s','t','v','z']
      var begins = ['c','h','j','w','bl','br','cr','cl','fr','fl','gr','gl','pr',
                    'pl','tr','ts','sk','st','tr','sp','spr','str',];
      var endings = ['rth','na','nna','nd','rd','xy','van','dan','mire','more'];

      var len = rand(5) > 0 ? 2 : 1;
      var ret = '';

      for (var i = 0; i < len; i++) {
  
        if( rand(3) === 1) {
          //33% chance of using a consonant cluster or a less-common consonant
          ret = addRandChar(ret, begins);
        } else {
          ret = addRandChar(ret, consonants);
        }
    
        if(len === 1 && rand(5) === 1) {
          //one-syllable names can have y as their vowel
          ret += 'y';
        } else {
          ret = addRandChar(ret, vowels);
        }
    
      }

      if(rand(4) > 0 || len === 1) {
        //75% chance of adding a consonant on the end
        if(rand(2)===1) {
          ret = addRandChar(ret, consonants);
        } else {
          ret = addRandChar(ret, endings);
        }
      }
  
      //this is dumb
      ret = ret.replace(/^./,ret.substring(0,1).toUpperCase());

      return ret;
    }

    this.generatePlanet = function() {
      var ret = {};
      ret.name = generatePlanetName();
      ret.type = rand(2);
  
      var popOrder = 7;
      if(ret.type === Types.G) {
        ret.radius = rand(85000) + 13000;
        popOrder = 4;
      } else {
        ret.radius = rand(12800) + 200;
      }
  
      ret.population = 0;
      var orderOfMag = rand(popOrder);
      if(orderOfMag === 1) { orderOfMag = 0; } //single-digit populations don't make sense
      while(orderOfMag > 0) {
        ret.population += rand(10) * Math.pow(10,orderOfMag-1);
        orderOfMag--;
      }
      return ret;
    }

}
