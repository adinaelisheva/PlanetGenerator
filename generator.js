var Planet = function() {
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
    };

    var generatePlanetType = function() {
      return rand(2);
    };
    
    var generatePlanetComposition = function(type) {
      return type; //for now
    };
    
    //note: this is g/cm^-3
    var generatePlanetDensity = function(composition, radius) {
      return composition === Types.T ? 5 : 1.25; //for now
    };
    
    var generatePopulation = function(type) {
      var order = (type === Types.G ? 4 : 7);
      var ret = 0;
      order = rand(order);
      if(order === 1) { order = 0; } //single-digit populations don't make sense
      while(order > 0) {
        order--;
        ret *= 10;
        ret += rand(10);
      }
      
      return ret;
  
    };
    
    //this is in km I think
    var generateRadius = function(type) {
      
      if(type === Types.G) {
        return rand(85000) + 13000;
      } else {
        return rand(12800) + 200;
      }
  
    };
    
    var getRandomHexRGB = function() {
      var ret = rand(255).toString(16);
      while(ret.length < 2) {
        ret = ret + '0';
      }
      return ret;
    }
    
    var getRandomHexColor = function(){
      return '#' + 
             getRandomHexRGB() +
             getRandomHexRGB() +
             getRandomHexRGB();
    }
    
    //takes in a css RGB string, eg: '#abcdef'
    var getDarkerColor = function(color){
      color = color.substring(1); //remove the '#'
      
      var ret = '#';
      
      for(var i = 0; i < 6; i+=2) {
        var hex = color.substring(i,i+2);
        hex = Number.parseInt('0x' + hex);
        hex = Math.max(0,hex - 0x10);
        ret += hex.toString(16);
      }
      
      return ret;
    
    }
    
    /* BEGIN PUBLIC API */
    
    this.getVolume = function() {
      return Math.pow(this.radius,3) * (4/3) * Math.PI;
    };
    
    this.drawPlanetImage = function(canvas) {
      
      var ctx = canvas.getContext('2d');
      var cx = canvas.width/2;
      var cy = canvas.height/2;
      
      var radius = Math.min(cx, cy) - (cy/10);
      
      ctx.fillStyle = getRandomHexColor();
      ctx.strokeStyle = getDarkerColor(ctx.fillStyle);
      ctx.lineWidth = 2;
      
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    
    };
    

    /* END PUBLIC API */
    
    /* CONSTRUCTOR */
    
    this.name = generatePlanetName();
    this.type = generatePlanetType();
    this.composition = generatePlanetComposition(this.type);
    this.radius = generateRadius(this.type);
    this.density = generatePlanetDensity(this.composition, this.radius);
    this.population = generatePopulation(this.type);
}
