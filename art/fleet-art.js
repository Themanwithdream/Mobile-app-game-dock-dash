/* Expansion fleet silhouettes. Rendered once per colour into the existing truck cache. */
(function(root){
  'use strict';
  const bodies=['foodtruck','breadvan','citytram','canalwagon','skyglider','arenasprinter','cementmixer','robotcarrier','prismhauler','beaconwagon','beaconrunner','tidecrawler','rangercart','reefrover','kitecarrier','canopyrunner','clockcoach','teawagon','caravancart','cometcourier'];
  function draw(c,col,theme){
    if(!bodies.includes(theme.body))return false;
    const cream='#fff0d1',ink='#132936',glass='#416779',metal='#a6bcc1',wood='#a4784f',accent=theme.accent;
    const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    const poly=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
    const line=(x,y,a,b,color,w=2)=>{c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
    const disc=(x,y,radius,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.fill();};
    const wheels=(ys=[24,101])=>{for(const y of ys)for(const x of [12,67]){r(x,y,11,22,'#08151e');for(let n=3;n<21;n+=5)r(x+2,y+n,7,2,'#48606a');}};
    const chassis=()=>{r(21,11,48,116,col.dark);r(24,14,42,70,col.mid);r(24,14,4,69,col.bright);};
    const cab=()=>{r(24,87,42,36,col.mid);r(27,90,36,15,glass);r(29,92,12,3,'#bde7e8');r(44,90,2,15,ink);r(24,123,42,5,metal);for(const x of [25,59])r(x,115,6,5,cream);};
    wheels();chassis();
    switch(theme.body){
      case 'beaconwagon':
        r(24,15,42,66,'#eed9ac');r(29,21,32,51,'#7b735c');r(38,51,14,26,accent);r(40,55,10,17,cream);r(36,48,18,5,ink);for(const x of [25,61])r(x,18,4,59,metal);cab();break;
      case 'beaconrunner':
        poly([[28,13],[62,13],[73,38],[69,87],[61,123],[29,123],[21,87],[17,38]],cream);for(const x of [11,66]){r(x,21,13,51,col.dark);for(const y of [26,39,52,65])r(x+2,y,9,2,col.bright);}
        disc(45,65,19,accent);disc(45,65,15,col.mid);disc(40,60,5,cream);cab();r(31,108,28,5,accent);break;
      case 'tidecrawler':
        wheels([13,55,97]);r(24,13,42,67,'#c7d8c4');for(const y of [20,64])r(28,y,34,7,col.mid);r(41,62,8,22,metal);disc(45,69,11,cream);disc(45,69,7,col.mid);line(45,69,45,61,ink,2);cab();r(33,107,24,9,accent);break;
      case 'rangercart':
        r(22,15,46,68,'#866544');for(const x of [26,60])r(x,17,4,60,cream);for(const y of [17,67])r(26,y,38,6,col.mid);for(const x of [31,55]){line(x,19,x,75,accent,2);line(x,22,x+4,22,cream,2);}cab();r(26,107,38,5,accent);break;
      case 'reefrover':
        wheels([15,96]);poly([[27,10],[63,10],[72,25],[68,82],[22,82],[18,25]],col.bright);r(26,20,38,59,cream);for(const x of [31,45,59]){line(x,64,x,45,accent,3);line(x,52,x-5,44,accent,2);line(x,55,x+4,46,accent,2);}cab();r(25,111,40,5,accent);break;
      case 'kitecarrier':
        poly([[22,19],[8,49],[13,80],[30,65],[60,65],[77,80],[82,49],[68,19]],cream);r(26,18,38,60,col.dark);poly([[45,62],[26,75],[45,85],[64,75]],accent);line(45,64,45,82,cream,1);cab();break;
      case 'canopyrunner':
        r(23,13,44,71,'#567c65');for(const x of [26,60])r(x,16,4,63,wood);for(const y of [20,63]){r(31,y,28,12,col.mid);for(const x of [35,49])disc(x,y+2,6,accent);}cab();r(28,108,34,6,accent);break;
      case 'clockcoach':
        r(22,12,46,71,'#8b6c4f');r(27,16,36,64,cream);disc(45,67,15,accent);disc(45,67,11,cream);line(45,67,45,58,ink,2);line(45,67,52,71,ink,2);for(const x of [26,60])r(x,19,4,52,col.mid);cab();break;
      case 'teawagon':
        r(22,14,46,68,'#c9b38b');for(const y of [21,62])r(26,y,38,10,cream);for(const x of [30,49]){r(x,63,10,9,col.mid);r(x+3,61,4,2,accent);}r(28,45,34,7,accent);cab();r(29,108,32,4,cream);break;
      case 'caravancart':
        r(22,12,46,70,wood);poly([[22,13],[68,13],[72,37],[67,79],[23,79],[18,37]],cream);for(const x of [29,54])r(x,17,7,62,accent);for(const y of [64,76])r(25,y,40,3,wood);cab();break;
      case 'cometcourier':
        poly([[30,7],[60,7],[73,53],[64,119],[45,132],[26,119],[17,53]],col.bright);for(const x of [17,63]){r(x,16,10,53,metal);r(x+2,18,6,42,col.dark);}r(31,16,28,60,col.dark);poly([[45,56],[58,68],[45,81],[32,68]],accent);line(35,68,45,59,cream,2);cab();break;
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
