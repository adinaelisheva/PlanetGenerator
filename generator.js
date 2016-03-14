var Planet = function() {
    var rand = function(n) { return ~~(Math.random() * n); };

    var Types = { T: 0, G: 1 };
    
    var ices = ['water ice', 'methane ice', 'dry ice', 'ammonia ice', 'nitrogen ice'];
    var silicates = ['olivine', 'basalt', 'quartz', 'magnesium silicate'];
    var gasses = ['hydrogen', 'helium', 'methane'];
    
    //in g/cm^3
    var densityMap = {
      'water ice': 0.9,
      'methane ice': 0.9,
      'dry ice': 1.5,
      'ammonia ice': 0.9,
      'nitrogen ice': 0.85,
      'silicate': 2.7,
      'iron': 7.8,
      'hydrogen': 0.00009,
      'helium': 0.000164,
      'methane': 0.000656,
      'gas core': 25 //not a real substance, basing on jupiter
    };

    this._generatePlanetName = function() {
  
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

      this.name = ret;
    };

        
    //this is in km
    this._generatePlanetRadius = function() {
      
      if(this.type === Types.G) {
        this.radius = rand(85000) + 13000;
      } else {
        this.radius = rand(12800) + 200;
      }
  
    };
    
        
    //this is the semi-major axis, in AU
    this._generatePlanetAxis = function() {
      
      if(this.type === Types.G) {
        //runs from 1.5AU to 40AU
        this.axis = (rand(385) + 15) / 10;
      } else {
        //runs from 0.02AU to 1.52
        this.axis = (rand(150) + 2) / 100;
      }
    } 
    
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
    this._generatePlanetComposition = function() {
      if(this.type === Types.T) {
        //terrestrial planets are assumed to be made of three things:
        // 1) metallic (iron) core
        // 2) silicate rocks
        // 3) various ices
        var core = rand(100);
        var silicate = rand(100 - core);
        
        var ice = 100 - core - silicate;
        var icename = ices[rand(ices.length)];
        
        //for density calculations, we only care about total silicate amount
        this.composition = { 'iron': core, 'silicate': silicate };
        this.composition[icename] = ice;
        
        //however, for color and interest, we care about specific rocks
        this.composition = addSilicateNames(this.composition);
      } else {
        this.composition = {};
        var number = rand(3) + 1; //number of gasses to include in this planet
        
        var core = rand(4) + 4;
        var total = 100 - core;
        this.composition['gas core'] = core;
        
        var gasname = gasses[rand(gasses.length)];
        
        //loop over all but the last gas
        for(var i = 0; i < number - 1 ; i++) {
          
          //save the current gas and update total
          this.composition[gasname] = rand(total);
          total -= this.composition[gasname];
          
          //find an unused gas
          do {
            gasname = gasses[rand(gasses.length)];
          } while (this.composition[gasname]);
          
        }
        
        //save final gas
        this.composition[gasname] = total;
        
      }
    };
    
    this._generatePlanetCloudsAndRings = function() {
      this.cloudCover = 0;
      this.rings = 0;
      if (this.type === Types.G) { 
        var r = rand(10);
        if (r  > 4) {
          this.rings = r > 8 ? 2 : 1;
        }      
      } else {
      
        //my marginally-accurate assumption. If you're too small, no clouds
        if (this.radius < 5000) { return; }
     
        //clouds aren't /that/ likely, but more likely with larger planets
        if(rand(10) > (1 + 8*(this.radius - 5000)/8000)) { return; }
      
        //if we get here, make some clouds!
        this.cloudCover = rand(100);
      }
      
    }
    
    //note: this is g/cm^-3
    this._generatePlanetDensity = function() {
      
      var density = 0;
      
      var components = Object.keys(this.composition);
      
      for(var c = 0; c < components.length; c++) {
        var item = components[c];
        if (densityMap[item]) {
          density += densityMap[item] * this.composition[item];
        }
      }
      
      //add some noise here to compensate for my vast oversimplifications
      var factor = (rand(10) / 100) + .95;
      density *= factor;
      
      return density/100;
    };
    
    var sumIces = function(comp){
      var keys = Object.keys(comp);
      var total = 0;
      for(var i = 0; i < keys.length; i++) {
        var item = keys[i];
        if(item.endsWith('ice')) { total += comp[item]; }
      }
      return total;
    };
    
    var sumMafics = function(comp) {
      var total = 0;
      if (comp.olivine) { total += comp.olivine; }
      if (comp.basalt) { total += comp.basalt; }
      return total;
    };
    
    this._generatePlanetAlbedo = function() {
      var wobble = (rand(10) - 5)/100; //this will be used by all cases
      this.albedo = 0;
      if (this.type === Types.G) {
        if (this.composition.methane > 0) {
          this.albedo = .4 + wobble;
        } else {
          this.albedo = .5 + wobble;
        }
        
      } else {
      
        var ice = sumIces(this.composition)/100;
        var mafic = sumMafics(this.composition)/100;
        var felsic = this.composition.silicate/100 - mafic;
        
        var landAlbedo = (ice * .7 + mafic * .1 + felsic * .3) + wobble;
        var cloudAlbedo =  .6 + rand(.3);
        var cc = this.cloudCover / 100;
        this.albedo = cc*cloudAlbedo + (1 - cc)*landAlbedo;
        
      }
      this.albedo = Math.round(this.albedo*100)/100;
    }
    
    this._adjustComposition = function() {
      if(this.type === Types.T) { return; }
      
      //it's a gas planet, remove that 'core' to leave some ~mystery~
      
      //delete might be inefficient? but max 4 things in this object so whatever
      delete this.composition['gas core'];
      
      var keys = Object.keys(this.composition);
      
      var total = 0;
      for(var i = 0; i < keys.length; i++) {
        var item = keys[i];
        total += this.composition[item];
      }
      
      for(var i = 0; i < keys.length; i++) {
        var item = keys[i];
        this.composition[item] = Math.round(this.composition[item]/total * 100);
        if (this.composition[item] === 0) { delete this.composition[item]; }
      }
      
    }
    
    this._generatePopulation = function() {
      var order = (this.type === Types.G ? 4 : 7);
      this.population = 0;
      order = rand(order);
      if(order === 1) { order = 0; } //single-digit populations don't make sense
      while(order > 0) {
        order--;
        this.population *= 10;
        this.population += rand(10);
      }
  
    };
    
    this._getColorFromComposition = function(){
      if (this.type === Types.G) {
        if (this.composition.methane && this.composition.methane > 0) {
          //uranus is only 2% methane and still very blue!
          return getMethaneGasColor();
        }
        return getOtherGasColor();
      } else {
        var ices = sumIces(this.composition);
        if (ices > 50) {
          return getIceColor();
        } else {
          return getSilicateColor();
        }
      }
      //default: return a white planet
      return { h: 0, s: 0, l: 1 };
    };
    
    var meteorStrike = function(ctx, num) {
      for(var i = 0; i < num; i++) {
        var w = ctx.canvas.width;
        var h = ctx.canvas.height;
        var x = rand(w);
        var y = rand(h);
        var rad = rand(Math.min(w,h)/15) + 1;
        ctx.beginPath();    
        ctx.arc(x, y, rad, 0, 2 * Math.PI);
        ctx.fill();
      }
    };
    
    var decorateImageT = function(ctx, color) {
      if (this.cloudCover > 90) {
        //you basically can't see anything past the clouds anyway
        return;
      }
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      
      //do a couple rounds of cratering
      ctx.fillStyle = hslToHex(getDarkerColor(color,0.08));
      meteorStrike(ctx,rand(300));
      ctx.fillStyle = hslToHex(getDarkerColor(color,0.05));
      meteorStrike(ctx,rand(250));

      ctx.restore();
      
    };
    
    var decorateImageG = function(ctx) {
    
    };
    
    //*** Utility Functions ***//
    
    //HSL/RGB functions modified from http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
    
    //hsl is [0,1] and rgb is [0,255]
    //input: {h, s, l}. return: {r, g, b}
    var hslToRgb = function(color) {
      
      var h = color.h;
      var s = color.s;
      var l = color.l;
      
      var r = l;
      var g = l;
      var b = l;

      if (s !== 0){
        var hue2rgb = function hue2rgb(p, q, t){
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }

      return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255)};
    }
    
    //color is [0,255]
    var rgbToHex = function(color) {
      var r = color.r.toString(16);
      var g = color.g.toString(16);
      var b = color.b.toString(16);
      if (r.length < 2) { r = '0' + r; }
      if (g.length < 2) { g = '0' + g; }
      if (b.length < 2) { b = '0' + b; }
      
      return '#' + r + g + b;
    };
    
    var hslToHex = function(color) {
      return rgbToHex(hslToRgb(color));
    };
    
    //this takes in 2 {h, s, l} colors and returns their average
    var getAverageColor = function(c1, c2) {
      return { h: (c1.h + c2.h) / 2,
               s: (c1.s + c2.s) / 2,
               l: (c1.l + c2.l) / 2 };
    };
    
    var getIceColor = function(){
      //ice is between a green and a blue
      //high l can make it white as well
      return { h: (rand(60) + 140)/360,
               s: (rand(25) + 50)/100,
               l: (rand(25) + 75)/100 };
    };
    
    var getSilicateColor = function(){
      //rocks are between red and orangeish
      //low s can make them grey and brown as well
      var ret = { h: (rand(25) + 10)/360,
                  s: (rand(60) + 20)/100 };
               
      //don't want rocks to be too bright
      if (ret.s < 0.5) { 
        ret.l = (rand(60) + 15) / 100;
      } else {
        ret.l = (rand(10) + 70) / 100;
      }
      return ret;
    };
    
    var getMethaneGasColor = function(){
      //this is various shades and lightnesses of blue
      return { h: (rand(35) + 180)/360,
               s: (rand(5) + 95)/100,
               l: (rand(20) + 60)/100 };
    };
    
    var getOtherGasColor = function() {
      //returns red, orange, yellow, or brown
      var ret = { h: rand(50)/360,
               s: (rand(50) + 50)/100,
               l: (rand(20) + 30)/100 };
      console.log(ret);
      return ret;
    };
    
    //takes in and returns object {h, s, l}
    var getDarkerColor = function(color,pct){
      if(!pct) { pct = 0.2; }
      var ret = { h: color.h, s: color.s, l: color.l };
      ret.l = Math.max(0, ret.l - pct);
      return ret;
    };
    
    /* BEGIN PUBLIC API */
    
    this.getVolume = function() {
      return Math.pow(this.radius,3) * (4/3) * Math.PI;
    };
    
    this.drawPlanetImage = function(canvas) {
      
      var ctx = canvas.getContext('2d');
      var cx = canvas.width/2;
      var cy = canvas.height/2;
      
      var radius = Math.min(cx, cy) - (cy/10);
      
      var color = this._getColorFromComposition();
      ctx.fillStyle = hslToHex(color);
      ctx.strokeStyle = hslToHex(getDarkerColor(color));
      ctx.lineWidth = 3;
      
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      //now draw the craters or clouds or what have you
      if (this.type === Types.T) {
        decorateImageT(ctx, color);
      } else {
        decorateImageG(ctx, color);
      }
      
      //now draw the outline
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.stroke();
    
    };
    

    /* END PUBLIC API */
    
    /* "CONSTRUCTOR" SECTION */
    
    this._generatePlanetName();
    this.type = rand(2);
    this._generatePlanetRadius();
    this._generatePlanetAxis();
    this._generatePlanetComposition();
    this.density = this._generatePlanetDensity();
    this._adjustComposition();
    this._generatePlanetCloudsAndRings();
    this._generatePlanetAlbedo()
    this._generatePopulation();
    
    /* END CONSTRUCTOR */
    
}
