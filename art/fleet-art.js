/* Original pixel fleet. Painted once per colour; gameplay reuses these sprites. */
(function(root){
  'use strict';
  const skinBodies={classic:'delivery',rally:'delivery',nightline:'delivery',gold:'delivery',school:'schoolbus',matchday:'sportshauler',festival:'tourbus',rescue:'ambulance',candy:'sweetvan',dino:'safari',arctic:'snowrunner',forest:'moonleaf',space:'starfreighter'};
  const bodies=['delivery','schoolbus','sportshauler','tourbus','ambulance','sweetvan','safari','snowrunner','moonleaf','starfreighter','fire','icecream','monster','rover','foodtruck','breadvan','citytram','canalwagon','skyglider','arenasprinter','cementmixer','robotcarrier','prismhauler','beaconwagon','beaconrunner','tidecrawler','rangercart','reefrover','kitecarrier','canopyrunner','clockcoach','teawagon','caravancart','cometcourier'];
  function draw(c,col,theme){
    const body=theme.body||skinBodies[theme.id];
    if(!bodies.includes(body))return false;
    const cream='#fff0d1',ink='#132936',glass='#345369',metal='#a6bcc1',wood='#a4784f',accent=theme.accent;
    const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    const poly=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
    const line=(x,y,a,b,color,w=2)=>{c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
    const disc=(x,y,radius,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.fill();};
    const tyre=(x,y,w=11,h=22)=>{r(x,y,w,h,'#071018');r(x+1,y+2,w-2,h-4,'#172a36');for(let n=4;n<h-3;n+=5){r(x+2,y+n,w-4,2,'#4b6470');r(x+2,y+n,2,2,'#78919a');}r(x+3,y+h/2-2,w-6,4,metal);};
    const wheels=(ys=[24,101])=>{for(const y of ys)for(const x of [12,67])tyre(x,y);};
    const chassis=()=>{r(23,13,47,118,'#00000055');r(20,10,50,117,ink);r(22,11,46,116,col.dark);r(24,14,42,70,col.mid);r(24,14,4,69,col.bright);r(26,13,38,2,'#fff7d660');r(63,17,3,65,col.dark);r(24,83,42,3,metal);};
    const cab=()=>{
      r(23,87,44,37,ink);r(25,88,40,34,col.dark);r(25,88,40,27,col.mid);r(27,88,36,3,col.bright);
      r(27,92,36,15,ink);r(29,94,32,10,glass);poly([[29,94],[49,94],[39,103],[29,103]],'#76c6d8');r(31,95,10,2,'#ddf6ed');r(44,94,2,11,ink);
      r(17,92,7,9,ink);r(18,93,5,5,metal);r(66,92,7,9,ink);r(67,93,5,5,metal);
      r(29,109,32,2,col.bright);r(33,115,24,6,ink);for(const y of [116,119])r(35,y,20,1,metal);
      for(const x of [25,59]){r(x-1,114,8,7,ink);r(x,115,6,3,cream);r(x+1,115,3,1,'#ffffff');r(x,119,6,2,accent);}
      r(24,124,42,5,ink);r(25,124,40,2,metal);r(30,127,30,1,'#697e85');r(39,125,12,4,cream);r(41,126,8,1,ink);
    };
    wheels();chassis();
    switch(body){
      case 'delivery':
        r(22,10,46,72,col.dark);r(24,12,42,69,col.mid);r(24,12,4,67,col.bright);r(28,12,34,3,col.bright);r(64,14,2,67,ink);
        for(let y=20;y<78;y+=8){r(29,y,31,2,col.dark);r(29,y+2,31,1,'#fff7d635');}
        for(const x of [27,61])r(x,16,2,63,metal);r(29,77,32,5,ink);
        if(theme.id==='rally')for(const x of [32,52])r(x,13,6,64,cream);
        if(theme.id==='nightline'){for(const x of [24,64])r(x,14,2,65,'#b5ffe2');r(25,14,39,2,'#b5ffe2');r(29,61,32,3,'#b5ffe2');}
        if(theme.id==='gold'){for(const x of [24,63])r(x,13,3,66,'#eac172');r(27,13,36,3,'#ffe4a1');for(const x of [37,44,51])r(x,61,3,6,'#ffe4a1');r(37,67,17,3,'#eac172');}
        cab();if(theme.id==='rally')for(const x of [34,51])r(x,108,5,5,cream);if(theme.id==='nightline')r(30,109,30,2,'#b5ffe2');if(theme.id==='gold')r(25,124,40,2,'#f9d985');break;
      case 'schoolbus':
        wheels([20,96]);r(20,9,50,114,ink);r(22,11,46,110,col.mid);r(24,12,4,108,col.bright);r(22,11,46,7,accent);
        for(const x of [25,59])for(const y of [22,39,56,73]){r(x,y,7,12,ink);r(x+1,y+1,5,8,glass);r(x+1,y+1,2,2,'#b8e3e8');}
        r(35,13,20,5,ink);r(37,14,16,2,cream);r(34,64,22,14,col.dark);for(const x of [24,62])r(x,86,4,4,accent);cab();r(28,110,34,3,accent);break;
      case 'sportshauler':
        poly([[28,12],[62,12],[71,80],[63,125],[27,125],[19,80]],col.dark);r(27,15,36,66,col.mid);
        for(const x of [28,58])r(x,17,4,61,cream);r(22,11,46,5,ink);r(25,12,40,2,accent);
        r(35,58,20,17,'#366a49');r(37,60,16,13,'#8db16c');disc(45,66,7,cream);poly([[45,61],[49,64],[47,69],[42,69],[40,64]],ink);cab();r(28,108,34,3,cream);break;
      case 'tourbus':
        r(20,8,50,117,ink);r(22,10,46,113,col.mid);r(24,11,42,6,accent);for(const x of [25,59])for(const y of [22,39,56,73]){r(x,y,7,13,glass);r(x+1,y+1,3,3,'#b9e6e5');}
        r(35,16,20,7,col.dark);r(37,18,16,2,metal);r(35,63,20,16,ink);disc(41,70,5,accent);disc(52,70,5,accent);cab();r(29,109,32,3,accent);break;
      case 'ambulance':
        r(20,14,50,107,ink);r(22,16,46,66,cream);for(const x of [24,61])r(x,17,5,64,col.mid);r(25,17,3,63,col.bright);
        r(35,61,20,17,'#db7569');r(42,62,6,14,cream);r(38,66,14,6,cream);cab();r(29,86,14,5,'#ee7971');r(47,86,14,5,'#99e5ff');r(30,109,30,3,cream);break;
      case 'sweetvan':
        poly([[25,12],[65,12],[70,23],[68,83],[22,83],[20,23]],col.dark);r(24,16,42,63,'#efc1d3');for(const x of [24,62])r(x,17,4,62,col.bright);
        for(const [x,y] of [[33,19],[54,22],[32,66],[52,67],[45,75]]){r(x,y,4,2,accent);r(x+1,y+2,2,2,cream);}r(30,60,30,7,col.mid);cab();r(29,109,32,3,'#efc1d3');break;
      case 'safari':
        wheels([14,99]);r(23,13,44,70,'#8caa72');for(const x of [24,62])r(x,16,4,66,col.dark);for(const y of [16,62,79])r(25,y,40,4,metal);
        r(31,61,28,16,col.mid);for(let x=34;x<60;x+=8)r(x,64,4,10,cream);r(16,44,6,44,wood);for(let y=49;y<86;y+=8)r(15,y,8,2,cream);cab();r(29,87,32,4,accent);break;
      case 'snowrunner':
        wheels([12,55,101]);r(22,11,46,72,cream);r(26,16,38,63,'#d1e4e1');for(const x of [24,62])r(x,16,4,65,col.mid);
        r(30,60,30,16,'#6b9daa');for(const y of [62,69])r(32,y,26,2,cream);r(15,44,5,38,col.bright);r(70,44,5,38,col.bright);cab();r(30,86,30,4,accent);break;
      case 'moonleaf':
        poly([[26,11],[64,11],[70,27],[67,81],[23,81],[20,27]],'#405f56');for(const x of [25,61]){r(x,18,4,62,col.mid);for(const y of [21,63])poly([[x-3,y],[x+3,y-5],[x+6,y],[x+1,y+5]],accent);}
        r(36,60,18,16,'#7a66a0');r(41,57,8,4,cream);r(39,63,12,8,col.bright);r(41,64,4,2,cream);cab();r(29,109,32,3,accent);break;
      case 'starfreighter':
        poly([[29,7],[61,7],[70,83],[64,126],[26,126],[20,83]],metal);r(28,16,34,65,col.dark);r(30,17,30,3,col.bright);
        for(const x of [13,65]){r(x,15,12,66,ink);r(x+2,17,8,57,col.mid);for(const y of [23,38,62])r(x+3,y,6,3,col.bright);r(x+3,77,6,7,accent);}r(35,61,20,15,'#625b8c');r(43,63,4,11,cream);r(38,67,14,3,cream);cab();break;
      case 'fire':
        wheels([14,55,101]);r(23,11,44,69,col.dark);for(const x of [27,60])r(x,15,3,63,cream);for(let y=18;y<78;y+=9)r(30,y,30,2,metal);cab();for(const x of [24,61]){r(x,87,5,5,'#f78573');r(x,94,5,5,'#a1e6ff');}r(29,109,32,3,cream);break;
      case 'icecream':
        r(21,19,48,64,cream);for(let x=24;x<67;x+=8)r(x,20,4,57,col.bright);poly([[39,17],[51,17],[45,27]],'#c79257');disc(45,13,8,'#ffdfd2');r(43,5,4,3,accent);
        r(26,63,38,11,ink);for(let x=27;x<64;x+=8)r(x,60,4,4,accent);cab();r(29,109,32,3,'#ffdfd2');break;
      case 'monster':
        for(const y of [18,91])for(const x of [3,65])tyre(x,y,22,36);r(25,12,40,69,col.dark);r(28,16,34,62,col.mid);
        for(const x of [30,58]){line(x,20,90-x,68,metal,3);r(x-1,18,3,4,accent);}cab();poly([[28,109],[35,115],[40,109],[45,118],[50,109],[61,116],[61,124],[29,124]],accent);break;
      case 'rover':
        wheels([15,59,103]);r(24,17,42,66,cream);for(const x of [16,61]){r(x,59,13,29,'#526992');for(const y of [62,70,78])r(x+1,y,11,2,'#a9c9e5');r(x+6,60,1,26,cream);}
        disc(45,12,10,metal);disc(45,12,7,cream);r(43,8,4,5,glass);r(44,18,2,8,metal);cab();r(29,109,32,3,accent);break;
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
