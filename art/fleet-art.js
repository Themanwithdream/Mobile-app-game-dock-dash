/* Expansion fleet silhouettes. Rendered once per colour into the existing truck cache. */
(function(root){
  'use strict';
  const bodies=['foodtruck','breadvan','citytram','canalwagon','skyglider','arenasprinter','cementmixer','robotcarrier','prismhauler'];
  function draw(c,col,theme){
    if(!bodies.includes(theme.body))return false;
    const cream='#fff0d1',ink='#132936',glass='#416779',metal='#a6bcc1',accent=theme.accent;
    const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    const poly=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
    const line=(x,y,a,b,color,w=2)=>{c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
    const disc=(x,y,radius,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.fill();};
    const wheels=(ys=[24,101])=>{for(const y of ys)for(const x of [12,67]){r(x,y,11,22,'#08151e');for(let n=3;n<21;n+=5)r(x+2,y+n,7,2,'#48606a');}};
    const chassis=()=>{r(21,11,48,116,col.dark);r(24,14,42,70,col.mid);r(24,14,4,69,col.bright);};
    const cab=()=>{r(24,87,42,36,col.mid);r(27,90,36,15,glass);r(29,92,12,3,'#bde7e8');r(44,90,2,15,ink);r(24,123,42,5,metal);for(const x of [25,59])r(x,115,6,5,cream);};
    wheels();chassis();
    switch(theme.body){
      case 'foodtruck':
        r(24,15,42,66,'#eee1c7');r(28,16,34,9,ink);for(let x=31;x<59;x+=6)r(x,18,3,5,metal);
        r(55,48,15,29,glass);r(57,49,11,21,cream);for(let y=47;y<78;y+=7)r(67,y,8,4,accent);
        r(28,65,24,12,col.mid);r(31,69,18,3,cream);cab();break;
      case 'breadvan':
        poly([[26,12],[64,12],[71,24],[69,85],[21,85],[19,24]],col.bright);r(26,17,38,66,'#dcc494');
        for(const y of [20,63,74]){r(28,y,34,5,cream);for(let x=30;x<61;x+=11){r(x,y-3,8,5,'#b7824f');r(x+2,y-3,2,2,'#f6dda5');}}
        cab();r(29,109,32,3,accent);break;
      case 'citytram':
        r(19,9,52,116,col.mid);r(23,12,44,112,col.bright);for(const y of [15,59,77,97]){r(27,y,36,11,glass);r(43,y,3,11,cream);}
        line(32,8,45,1,metal,3);line(45,1,58,8,metal,3);r(25,118,40,7,col.dark);for(const x of [27,59])r(x,118,4,3,cream);break;
      case 'canalwagon':
        r(22,15,46,68,'#805c43');r(26,19,38,61,'#c7a377');for(const x of [28,58])r(x,20,4,58,cream);
        for(const y of [20,65]){r(31,y,24,13,'#a8c591');for(const x of [35,45,52]){disc(x,y+5,4,accent);disc(x+1,y+6,1,cream);}}
        line(22,17,68,17,accent,4);cab();break;
      case 'skyglider':
        poly([[21,45],[3,61],[3,83],[29,75],[61,75],[87,83],[87,61],[69,45]],col.mid);
        for(const x of [16,64]){r(x,15,10,51,metal);r(x+2,17,6,42,col.dark);r(x+2,60,6,9,accent);}
        poly([[30,14],[60,14],[67,73],[58,125],[32,125],[23,73]],col.bright);r(32,90,26,18,glass);r(34,92,8,4,cream);
        poly([[35,68],[45,59],[55,68],[45,83]],accent);r(37,116,16,6,col.dark);break;
      case 'arenasprinter':
        poly([[28,16],[62,16],[71,74],[64,121],[26,121],[19,74]],col.mid);r(22,14,46,6,ink);r(27,15,36,2,accent);
        for(const x of [32,52])r(x,20,5,96,cream);r(29,76,32,28,glass);r(31,78,28,6,'#9fd1da');r(29,108,32,7,col.dark);
        for(const x of [25,61])r(x,110,4,7,cream);break;
      case 'cementmixer':
        wheels([14,55,99]);r(24,16,42,63,'#c2c9bc');poly([[32,14],[58,14],[68,32],[66,66],[56,79],[34,79],[24,66],[22,32]],cream);
        for(const y of [20,42,64])poly([[26,y],[31,y-5],[65,y+12],[60,y+17]],col.mid);r(38,77,14,8,metal);cab();r(29,108,32,4,accent);break;
      case 'robotcarrier':
        for(const x of [10,69]){r(x,14,11,112,ink);for(let y=18;y<125;y+=7)r(x+2,y,7,3,metal);}
        r(24,13,42,68,col.dark);for(const x of [27,61]){line(x,17,x,74,accent,2);r(x-2,64,5,5,accent);}
        r(31,61,28,17,metal);r(35,59,20,15,'#dce9df');r(37,63,5,4,col.mid);r(48,63,5,4,col.mid);r(41,74,8,5,ink);
        cab();r(29,110,32,3,accent);break;
      case 'prismhauler':
        for(const x of [18,63])poly([[x,19],[x+9,14],[x+10,76],[x+4,84],[x-3,74]],col.bright);
        r(26,16,38,65,col.dark);line(30,18,30,75,accent,2);line(60,18,60,75,accent,2);
        c.strokeStyle=col.bright;c.lineWidth=5;c.beginPath();c.ellipse(45,66,12,10,0,0,Math.PI*2);c.stroke();
        poly([[45,53],[51,58],[45,63],[39,58]],col.mid);cab();r(29,108,32,4,accent);break;
    }
    return true;
  }
  root.DockDashFleetArt={bodies,draw};
})(typeof globalThis!=='undefined'?globalThis:this);
