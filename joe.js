/***
    Joe - a little library for adsr envelopes
    '...  a couple of quarts of beer, would fix it so the intonation would not offend your ear ...'
***/

function Joe(params) {
if(!params) params=/*[newPt(0,0.1667),//start from 
                    newPt(0.05,0.95),//attack
                    newPt(0.1,0.80),//decay
                    newPt(0.25,0.90),//sustain
                    newPt(0.99,0.01),//release
                    ];*/
                   [newPt(0,0.1667),//start from 
                    newPt(0.01,0.86),//attack
                    newPt(0.026,1.03),//decay
                    newPt(0.038,0.85),//sustain
                    newPt(0.545,0.05),//release
                    ];
                   
  var quarts = this.quarts = params;
  
  Joe.prototype.spill = function() {
    return quarts;
  }
  
  //scale to fit
  Joe.prototype.goggles = function(w,h) {
    return quarts.map(function (e) { return newPt(w - e.x*w,e.y*h); });
  }
  
  //assumes default params!
  Joe.prototype.ads = function(currentTime,hz,volume,oscillator,gain) {
    gain.gain.cancelScheduledValues(currentTime);
    gain.gain.setValueAtTime(volume/6,currentTime);
    //attack
    var a = quarts[1];
    gain.gain.linearRampToValueAtTime(volume * a.y,currentTime + a.x);
    //gain.gain.exponentialRampToValueAtTime(volume * 2,currentTime + attackFor/2);
    
    //TODO how to represent pitch-shifting in curve drawing? just another colored line???
    //oscillator.frequency.setValueAtTime(hz*a.y, currentTime );
    //oscillator.frequency.exponentialRampToValueAtTime(hz, currentTime + a.x );
    //decay
    var d = quarts[2];
    gain.gain.linearRampToValueAtTime(volume * d.y,currentTime + d.x);

    //sustain
    var s = quarts[3];
    gain.gain.linearRampToValueAtTime(volume * s.y, currentTime + s.x);  
  }
  
  Joe.prototype.release = function(currentTime,volume,gain,oscillator) {
    var r = quarts[quarts.length-1];
    gain.gain.linearRampToValueAtTime(volume * r.y, currentTime + r.x);
    oscillator.stop(currentTime + r.x);
    setTimeout(stopIt,1000 * r.x);
    function stopIt() {
      oscillator.stop();
      gain.disconnect();
    }
  }
  
  Joe.prototype.attack = function(currentTime,hz,volume,oscillator,gain) {
    //TODO parametrize hz mods
    //oscillator.frequency.setValueAtTime(hz*quarts[1].y, currentTime );
    //oscillator.frequency.exponentialRampToValueAtTime(hz, currentTime + quarts[1].x );
    
    for (var i = 0; i < quarts.length-1; i++) {
      var quart = quarts[i];
      gain.gain.linearRampToValueAtTime(volume * quart.y, currentTime+quart.x);
    }
  }   

  Joe.prototype.turnitdown = function(compressor) {
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.reduction.value = -20;
    compressor.attack.value = quarts[1].x;
    compressor.release.value = quarts[quarts.length-1].x;
  }
}