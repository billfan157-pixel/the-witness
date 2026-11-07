(function(root){
  'use strict';
  // Pure geometry helpers for the objective compass.
  // Engine convention (vendor/adventure-3d.js): the camera sits behind the player at
  // player + (sin yaw, cos yaw) and looks back, so the look bearing is yaw + PI.
  // A position pair is [x, z]; +x is east, +z runs away from the camera (south).
  const TAU=Math.PI*2;
  function normalize(a){a=a%TAU;if(a>Math.PI)a-=TAU;else if(a<=-Math.PI)a+=TAU;return a;}
  function heading(yaw){return normalize(yaw+Math.PI);}
  function bearing(from,to){return Math.atan2(to[0]-from[0],to[1]-from[1]);}
  // Screen rotation for a needle that points up when the target is straight ahead.
  // Positive means clockwise on screen, matching CSS rotate().
  function angleTo(yaw,from,to){
    const dx=to[0]-from[0],dz=to[1]-from[1];
    const right=Math.cos(yaw)*dx-Math.sin(yaw)*dz;
    const forward=-Math.sin(yaw)*dx-Math.cos(yaw)*dz;
    return Math.atan2(right,forward);
  }
  function distance(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1]);}
  function formatDistance(m){return Math.max(0,Math.round(m))+' m';}
  const Compass={normalize,heading,bearing,angleTo,distance,formatDistance};
  root.WitnessCompass=Compass;
  if(typeof module!=='undefined')module.exports=Compass;
})(globalThis);
