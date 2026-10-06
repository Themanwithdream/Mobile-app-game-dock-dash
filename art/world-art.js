/* Original keeper cargo and static world landmarks. Extends the native canvas art. */
(function(root){
  'use strict';
  const kinds=['longbow','quiver','satchel','feather','bracer','cloak','oldkey','gear','lens','compass','coral','pearl','flipper','headphones','kite','weathervane','magnet','mosaic','flute','shell'];
  function brushes(c,col){
    const cream='#fff0d2',ink='#17303c',wood='#a4784f',gold='#e1b866',green='#80b78e';
    const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    const line=(x,y,a,b,color,w=2)=>{c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
    const poly=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
    const disc=(x,y,radius,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.fill();};
    const ring=(x,y,radius,width,color)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.stroke();};
    return {cream,ink,wood,gold,green,r,line,poly,disc,ring};
  }
  function draw(c,kind,col){
    if(!kinds.includes(kind))return false;
    const {cream,ink,wood,gold,green,r,line,poly,disc,ring}=brushes(c,col);
    switch(kind){
      case 'longbow':
        c.strokeStyle=wood;c.lineWidth=4;c.beginPath();c.moveTo(-8,-17);c.quadraticCurveTo(17,0,-8,17);c.stroke();line(-8,-17,-8,17,cream,1.4);line(-17,0,18,0,col,2);poly([[18,0],[11,-4],[11,4]],gold);r(-1,-3,4,6,col);break;
      case 'quiver':
        for(const x of [-6,0,6]){line(x,-18,x+2,8,wood,2);poly([[x,-19],[x+3,-15],[x+1,-12],[x-3,-16]],cream);}poly([[-11,-4],[11,-4],[8,17],[-8,17]],col);r(-11,-4,22,4,gold);line(-7,0,-5,12,cream,1);break;
      case 'satchel':ring(0,-6,10,3,wood);r(-15,-7,30,24,col);r(-15,-7,30,9,wood);r(-3,-1,6,6,gold);r(-12,11,24,3,'#ffffff44');break;
      case 'feather':
        poly([[-12,8],[-10,-4],[0,-16],[12,-18],[14,-8],[5,7],[-8,14]],col);line(-15,18,11,-14,cream,2);for(const y of [-9,-3,3])line(-2,y,8,y-4,cream,1);break;
      case 'bracer':poly([[-12,-15],[9,-13],[13,14],[-8,17]],wood);for(const y of [-8,0,8]){line(-10,y,11,y-2,col,3);r(5,y-4,5,4,gold);}break;
      case 'cloak':poly([[-7,-14],[0,-19],[7,-14],[10,-5],[17,16],[-17,16],[-10,-5]],col);poly([[-7,-12],[0,-16],[7,-12],[0,-3]],ink);line(-4,-1,-9,12,cream,1);line(4,-1,9,12,cream,1);disc(0,0,2,gold);break;
      case 'oldkey':ring(-7,-8,8,4,gold);line(-2,-2,12,15,gold,4);line(6,8,12,3,gold,4);line(11,13,17,8,gold,4);break;
      case 'gear':for(let i=0;i<8;i++){c.save();c.rotate(i*Math.PI/4);r(-3,-18,6,10,gold);c.restore();}disc(0,0,14,wood);disc(0,0,11,gold);disc(0,0,6,ink);disc(0,0,3,col);break;
      case 'lens':disc(0,0,16,gold);disc(0,0,13,ink);disc(0,0,11,col);poly([[-8,-5],[-1,-10],[6,-10],[-7,8]],'#ffffff88');line(6,8,9,4,cream,2);break;
      case 'compass':disc(0,0,16,wood);disc(0,0,13,cream);ring(0,0,11,1,gold);poly([[0,-12],[5,2],[0,0],[-5,-2]],col);poly([[0,12],[-5,-2],[0,0],[5,2]],ink);disc(0,0,2,gold);for(const a of [0,1,2,3]){c.save();c.rotate(a*Math.PI/2);r(-1,-10,2,3,wood);c.restore();}break;
      case 'coral':line(0,16,0,-8,col,5);for(const [x,y]of[[-12,-8],[12,-11],[-9,3],[10,4]]){line(0,10,x,y,col,4);line(x,y,x-3,y-7,col,3);line(x,y,x+4,y-6,col,3);}r(-11,14,22,4,cream);break;
      case 'pearl':r(-15,5,30,10,wood);poly([[-15,4],[-12,-7],[0,-13],[12,-7],[15,4]],col);disc(0,1,10,cream);disc(-3,-3,3,'#ffffff');r(-14,11,28,3,gold);break;
      case 'shell':poly([[-15,6],[-17,-3],[-12,-12],[0,-17],[12,-12],[17,-3],[15,6],[6,13],[-6,13]],col);for(const x of [-12,-6,0,6,12])line(0,11,x,-8,cream,1);r(-6,12,12,4,gold);break;
      case 'flipper':for(const x of [-14,3]){poly([[x+3,-16],[x+9,-16],[x+12,-5],[x+15,15],[x,15],[x+1,-5]],col);r(x+4,-12,5,12,ink);line(x+4,4,x+2,11,cream,1);}break;
      case 'headphones':c.strokeStyle=ink;c.lineWidth=6;c.beginPath();c.arc(0,0,14,Math.PI,Math.PI*2);c.stroke();r(-18,-2,9,18,col);r(9,-2,9,18,col);r(-15,1,3,12,cream);r(11,1,3,12,cream);break;
      case 'kite':poly([[0,-18],[14,0],[0,15],[-14,0]],col);poly([[0,-18],[0,15],[-14,0]],gold);line(0,-18,0,15,cream,1);line(-14,0,14,0,cream,1);line(0,15,7,23,wood,1);poly([[3,18],[11,17],[7,22]],col);break;
      case 'weathervane':line(0,-15,0,16,wood,3);line(-17,-8,17,-8,gold,2);poly([[17,-8],[10,-13],[10,-3]],col);r(-15,-12,7,8,col);r(-10,15,20,3,gold);disc(0,-8,3,cream);break;
      case 'magnet':c.strokeStyle=col;c.lineWidth=9;c.beginPath();c.moveTo(-11,-13);c.lineTo(-11,2);c.arc(0,2,11,Math.PI,0,true);c.lineTo(11,-13);c.stroke();r(-16,-16,10,7,cream);r(6,-16,10,7,cream);break;
      case 'mosaic':r(-16,-16,32,32,wood);for(let y=-12;y<13;y+=8)for(let x=-12;x<13;x+=8)r(x,y,6,6,(x+y)%16?col:cream);break;
      case 'flute':c.save();c.rotate(-.55);r(-3,-18,7,36,wood);r(-3,-18,7,4,cream);for(const y of [-8,-1,6,13])disc(0,y,1.5,ink);r(-3,16,7,3,col);c.restore();break;
    }
    return true;
  }
  const fingerprint=w=>[...w.id].reduce((n,ch)=>(n*31+ch.charCodeAt(0))>>>0,17);
  function scene(c,w,drawCargo,lit=false,illustrated=false){
    if(!w.scene)return;
    const seed=fingerprint(w),col=w.accent,{cream,ink,wood,gold,green,r,line,poly,disc,ring}=brushes(c,col);
    // All additions are outside the live conveyor. This runs only when a floor is built.
    c.save();c.imageSmoothingEnabled=false;
    const side=seed%2?1:-1,x=side===1?310:50,y=235+(seed%4)*22;
    if(!illustrated){
    c.save();c.translate(x,y);
    r(-26,-27,52,62,'#101e27b8');r(-24,-25,48,3,col);r(-24,32,48,3,wood);
    const feature=w.landmark;
    if(['archery'].includes(feature)){
      for(const a of [-12,12]){r(a-2,-20,4,39,wood);disc(a,-5,12,cream);disc(a,-5,8,'#c77560');disc(a,-5,4,col);}line(-22,18,22,18,wood,3);
    }else if(['windmill','clock'].includes(feature)){
      poly([[-14,24],[14,24],[10,-15],[-10,-15]],cream);disc(0,-6,12,wood);disc(0,-6,8,col);
      if(feature==='clock'){line(0,-6,0,-13,ink);line(0,-6,5,-2,ink);}else for(let i=0;i<4;i++){c.save();c.translate(0,-6);c.rotate((seed%8)*.1+i*Math.PI/2);r(-3,-24,6,23,wood);r(-1,-24,10,14,cream);c.restore();}
    }else if(['bridge','rail'].includes(feature)){
      for(const a of [-18,18])r(a,-22,3,50,col);for(let n=-20;n<26;n+=7)r(-15,n,30,4,feature==='rail'?gold:wood);
    }else if(['garden','orchard','tree','herbs','nursery','mangrove','canopy','nest','kelp'].includes(feature)){
      for(const [a,b]of[[-13,-9],[12,3],[-8,20]]){r(a-6,b+7,13,6,wood);line(a,b+8,a,b-7,green,2);for(const dx of [-5,5]){disc(a+dx,b,6,green);r(a+dx,b-2,3,3,col);}}
    }else if(['pond','reef','waterfall'].includes(feature)){
      poly([[-23,-19],[16,-21],[23,-3],[17,22],[-14,26],[-22,12]],'#498b97');for(const n of [-12,0,12]){line(-14,n,16,n-2,'#a4e5db',1);drawCargo(c,{kind:feature==='reef'?'coral':'lotus',accent:col,group:0,variant:0},n,n/2,16);}
    }else if(['glasshouse','solar'].includes(feature)){
      r(-22,-18,44,40,'#416e84');for(const a of [-14,0,14])line(a,-18,a,22,cream,2);for(const b of [-8,7,22])line(-22,b,22,b,cream,2);poly([[-22,-18],[0,-29],[22,-18]],col);
    }else if(['lighthouse','signal','observatory'].includes(feature)){
      r(-10,-14,20,40,cream);r(-16,-24,32,14,wood);r(-12,-22,24,9,col);poly([[-18,-24],[0,-33],[18,-24]],gold);r(-3,12,6,14,ink);line(-8,-2,8,-2,wood,3);
    }else if(['airship','kite','sailboat','planet'].includes(feature)){
      drawCargo(c,{kind:feature==='kite'?'kite':feature==='planet'?'globe':feature==='airship'?'wingpack':'reedboat',accent:col,group:0,variant:seed%12},0,-3,45);line(-17,21,17,21,wood,3);
    }else if(['castle','arch'].includes(feature)){
      for(const a of [-22,12]){r(a,-22,10,48,cream);r(a-3,-26,16,7,wood);}r(-12,-22,24,9,col);r(-12,6,24,20,'#304b48');
    }else if(['forge','oven','pottery'].includes(feature)){
      r(-19,-18,38,43,wood);poly([[-20,-18],[-12,-28],[12,-28],[20,-18]],cream);disc(0,3,13,ink);poly([[-7,13],[-9,1],[-2,5],[2,-7],[9,4],[6,13]],gold);r(-20,23,40,5,col);
    }else if(['archive','mosaic'].includes(feature)){
      r(-22,-22,44,48,wood);for(let b=-17;b<23;b+=14){for(let a=-17;a<20;a+=7)r(a,b,5,11,(a+b+seed)%3?col:cream);r(-22,b+11,44,2,gold);}
    }else if(feature==='robot'){
      drawCargo(c,{kind:'robotkit',accent:col,group:0,variant:0},0,-2,43);r(-20,21,40,4,wood);
    }else{
      r(-23,-17,46,10,col);for(let a=-22;a<21;a+=10)r(a,-16,5,9,cream);r(-19,16,38,11,wood);for(const a of [-19,17])r(a,-8,3,26,wood);
      drawCargo(c,{kind:feature==='music'?'lyre':feature==='festival'?'bell':'basket',accent:col,group:0,variant:0},0,6,23);
    }
    c.restore();
    // Local supplies also dress the procedural loading fallback.
    const entries=w.cargo.split(';'),otherX=side===1?42:318;
    for(let i=0;i<4;i++){
      const py=172+i*56+(seed%3)*3;r(otherX-19,py-17,38,36,'#342f26d9');r(otherX-18,py-17,36,3,gold);
      const entry=entries[(i*3+seed%3)%12],kind=entry.split('|')[1];drawCargo(c,{kind,accent:col,group:0,variant:i},otherX,py,25);
    }
    }
    // A persistent little keeper lantern marks a completed eight-part story.
    const lx=side===1?316:44;r(lx-8,421,16,3,wood);r(lx-6,403,12,17,lit?'#e6b85b':'#44616b');r(lx-4,406,8,10,lit?'#fff0b0':'#1b3440');r(lx-7,400,14,3,gold);
    c.restore();
  }
  root.DockDashWorldArt={kinds,draw,scene,fingerprint};
})(typeof globalThis!=='undefined'?globalThis:this);
