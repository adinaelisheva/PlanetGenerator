var Planet = function() {
    var rand = function(n) { return ~~(Math.random() * n); };

    var Types = { T: 0, G: 1 };
    
    var ices = ['water ice', 'methane ice', 'dry ice', 'ammonia ice', 'nitrogen ice'];
    var silicates = ['olivine', 'basalt', 'quartz', 'magnesium silicate'];
    
    var densityMap = {
      'water ice': 0.9,
      'methane ice': 0.9,
      'dry ice': 1.5,
      'ammonia ice': 0.9,
      'nitrogen ice': 0.85,
      'silicate': 2.7,
      'iron': 7.8
    };

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
    
    //helper function to add some rock names to a composition map
    var addSilicateNames = function(map) {
      var amt = map.silicate;
      
      var tworocks = (rand(3) === 1); //30% chance of splitting the composition
      
      if (tworocks) {      
        amt = rand(map.silicate-1) + 1;
      }
      
      var rock = silicates[rand(silicates.length)];
      map[rock] = amt;
      
      if (tworocks) {
        //now add the second rock, but make sure it's not a duplicate
        do {
          rock = silicates[rand(silicates.length)];
        } while(map[rock]);
        
        //now rock will be something not in the map yet
        map[rock] = map.silicate - amt;
      }
      
      return map;
    }
    
    //returns a map from material to percentage
    var generatePlanetComposition = function(type) {
      if(type === Types.T) {
        //terrestrial planets are assumed to be made of three things:
        // 1) metallic (iron) core
        // 2) silicate rocks
        // 3) various ices
        var core = rand(100);
        var silicate = rand(100 - core);
        
        var ice = 100 - core - silicate;
        var icename = ices[rand(ices.length)];
        
        //for density calculations, we only care about total silicate amount
        var ret = { 'iron': core, 'silicate': silicate };
        ret[icename] = ice;
        
        //however, for color and interest, we care about specific rocks
        ret = addSilicateNames(ret);
        return ret;          
      } else {
        return { 'gas': 1 }
      }
    };
    
    //note: this is g/cm^-3
    var generatePlanetDensity = function(composition, radius) {
      
      var density = 0;
      
      var components = Object.keys(composition);
      
      for(var c = 0; c < components.length; c++) {
        var item = components[c];
        if (densityMap[item]) {
          density += densityMap[item] * composition[item];
        }
      }
      
      //add some noise here to compensate for my vast oversimplifications
      var factor = (rand(10) / 100) + .95;
      density *= factor;
      
      return density/100;
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
    
    //this is the semi-major axis, in AU
    var generateAxis = function(type) {
      
      if(type === Types.G) {
        //runs from 1.5AU to 40AU
        return (rand(385) + 15) / 10;
      } else {
        //runs from 0.02AU to 1.52
        return (rand(150) + 2) / 100;
      }
    } 
    
    
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
        ret = '0' + ret;
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
        hex = Number.parseInt(hex, 16);
        hex = Math.max(0,hex - 0x10);
        
        str = hex.toString(16);
        while(str.length < 2) {
          str = '0' + str;
        }
        
        ret += str;
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
      ctx.lineWidth = 3;
      
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    
    };
    

    /* END PUBLIC API */
    
    /* "CONSTRUCTOR" SECTION */
    
    this.name = generatePlanetName();
    this.type = generatePlanetType();
    this.composition = generatePlanetComposition(this.type);
    this.radius = generateRadius(this.type);
    this.axis = generateAxis(this.type);
    this.density = generatePlanetDensity(this.composition, this.radius);
    this.population = generatePopulation(this.type);
    
    /* END CONSTRUCTOR */
    
}
