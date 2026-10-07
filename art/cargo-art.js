/* Small cargo silhouettes, drawn once into the game's bounded sprite caches. */
(function(root) {
  'use strict';
  const kinds=['guitar','soccerball','cleats','keepergloves','kitbag','trophy','dinosaur','amphora','scroll','romanshield','romanhelmet','laurel','wheat','standard','tunic','lyre','stoneblock','column','coins','linen','basket','lotus','scarab','obelisk','sundial','reedboat','roundshield','barrel','vikingaxe','rope','longship','runestone','drinkinghorn','fishbasket','amber','silkrolls','spices','rug','porcelain','paperfan','jade','seal','abacus'];
  function draw(c,kind,col,name='') {
    if(!kinds.includes(kind))return false;
    const cream='#fff1d1',ink='#172c38',shade='#456171',gold='#eabe66',wood='#aa744b',red='#bd5e55',jade='#8ec7a0';
    const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    const poly=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
    const line=(x,y,a,b,color,w=2)=>{c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
    const disc=(x,y,radius,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.fill();};
    const ring=(x,y,radius,width,color)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.stroke();};
    const woven=()=>{r(-13,-3,26,17,wood);r(-11,-1,22,13,gold);for(let y=1;y<13;y+=4)line(-11,y,11,y,wood,1);for(let x=-8;x<12;x+=5)line(x,-1,x,13,wood,1);};
    switch(kind) {
      case 'guitar': {
        // Stable cargo names select artwork only; IDs, pools and sorting stay the same.
        if(name==='Guitar strings'){
          r(-12,-16,24,33,ink);r(-11,-15,22,31,col);r(-11,-15,22,5,cream);
          r(-8,-12,16,1,wood);for(const y of [-7,-4])r(-7,y,14,1,shade);
          ring(0,6,8,1.5,cream);ring(0,6,5.5,1,shade);line(5,12,8,15,cream,1);
          r(-9,-9,2,23,'#ffffff45');break;
        }
        const electric=name==='Electric guitar',small=name==='Ukulele',inCase=name==='Guitar case';
        const edge=inCase?gold:'#49392f',face=inCase?'#345365':small?'#dfa564':'#edc580';
        c.save();if(small)c.scale(.82,.92);
        if(electric){
          poly([[-3,-4],[-6,-8],[-9,-8],[-8,-3],[-11,1],[-13,5],[-13,12],[-9,17],[7,17],[12,13],[12,5],[9,1],[7,-2],[7,-8],[4,-6],[3,-3]],ink);
          poly([[-3,-2],[-6,-7],[-7,-7],[-6,-2],[-10,2],[-12,5],[-12,11],[-8,16],[6,16],[11,12],[11,5],[8,2],[6,-1],[6,-6],[4,-4],[3,-1]],col);
          poly([[3,-2],[5,-2],[5,1],[8,4],[7,11],[-5,11],[-6,4],[-3,1],[-3,-2]],cream);
          r(-5,2,10,2,ink);r(-5,7,10,2,ink);r(-5,12,10,3,shade);r(-4,12,8,1,cream);
          r(8,11,2,2,gold);r(7,14,2,2,gold);r(-11,6,2,5,'#ffffff55');
        }else{
          // Contoured bouts, a pinched waist and wood shading survive small icons.
          poly([[-4,-4],[-7,-6],[-10,-5],[-12,-2],[-12,1],[-10,4],[-8,5],[-8,7],[-11,8],[-13,11],[-13,14],[-11,17],[-7,18],[7,18],[11,17],[13,14],[13,11],[11,8],[8,7],[8,5],[10,4],[12,1],[12,-2],[10,-5],[7,-6],[4,-4]],edge);
          poly([[-4,-3],[-7,-5],[-9,-4],[-11,-2],[-11,1],[-9,3],[-7,4],[-7,7],[-10,9],[-12,11],[-12,14],[-10,16],[-7,17],[7,17],[10,16],[12,14],[12,11],[10,9],[7,7],[7,4],[9,3],[11,1],[11,-2],[9,-4],[7,-5],[4,-3]],face);
          poly([[7,-5],[10,-3],[11,0],[9,3],[7,4],[7,7],[10,9],[12,11],[12,14],[10,16],[7,17],[4,17],[8,15],[10,13],[10,11],[8,8],[5,6],[5,4],[8,1],[8,-2],[5,-4]],inCase?shade:'#c68e50');
          r(-9,-2,2,3,inCase?'#718997':'#ffe4a7');r(-10,10,2,4,inCase?'#718997':'#ffe4a7');
          if(inCase){
            r(-4,-15,8,17,edge);r(-3,-14,6,17,face);r(-5,-18,10,5,edge);r(-4,-17,8,4,face);
            r(10,1,5,8,gold);r(11,3,2,4,ink);for(const y of [0,10]){r(-11,y,3,2,cream);r(8,y,3,2,cream);}
            r(-4,6,8,5,col);r(-2,7,4,1,cream);c.restore();break;
          }
          disc(0,3,4.5,'#bb823e');disc(0,3,3.4,ink);
          if(!small)poly([[4,1],[7,1],[8,3],[7,8],[3,8],[3,7],[4,5]],'#795137');
          r(-5,12,10,3,edge);r(-4,12,8,1,cream);
        }
        const head=small?-15:-18,nut=head+6;
        r(-3,nut,6,1-nut,edge);r(-2,nut+1,4,-nut-1,electric?shade:'#7c5438');
        r(-4,head,8,6,edge);r(-3,head+1,6,4,'#b07c4c');r(-3,nut,6,1,cream);
        for(const y of small?[head+1,head+4]:[head+1,head+3,head+5]){r(-6,y,2,1.5,cream);r(4,y,2,1.5,cream);}
        for(let y=nut+3;y<0;y+=3)r(-2,y,4,1,'#d5b786');
        const strings=small?4:6;for(let i=0;i<strings;i++)r(-1.9+i*3.8/(strings-1),nut+1,.35,13-nut,'#fff2c9');
        c.restore();break;
      }
      case 'soccerball':
        // A circular rim, connected pentagon panels and one subtle shaded edge.
        disc(0,0,16,ink);disc(0,0,14.5,cream);
        c.save();c.beginPath();c.arc(0,0,14.5,0,Math.PI*2);c.clip();
        poly([[-4,-6],[4,-6],[7,1],[0,6],[-7,1]],ink);
        for(let i=0;i<5;i++){c.save();c.rotate(i*Math.PI*2/5);poly([[-4,-16],[4,-16],[5,-12],[0,-9],[-5,-12]],ink);line(0,-9,0,-6,shade,1);c.restore();}
        c.restore();line(-8,-9,-5,-11,'#ffffff',2);break;
      case 'cleats':
        poly([[-13,-12],[-4,-12],[-4,-4],[8,-2],[14,4],[14,9],[-14,9],[-14,2]],col);
        r(-14,9,28,3,cream);for(const x of [-10,-2,7,12])r(x,12,3,4,ink);
        line(-4,-2,2,1,cream);line(-7,1,-1,4,cream);r(-12,-10,5,9,shade);break;
      case 'keepergloves':
        for(const side of [-1,1]){c.save();c.translate(side*8,0);c.scale(side,1);
          r(-5,-6,10,17,cream);r(-5,-14,3,11,col);r(-1,-16,3,12,col);r(3,-13,3,10,col);
          poly([[-4,-3],[-9,-5],[-10,0],[-5,5]],cream);r(-5,10,11,5,col);r(-3,12,7,2,shade);line(-2,-1,3,-1,shade,1);c.restore();}break;
      case 'kitbag':
        ring(0,-6,7,3,cream);r(-16,-6,32,20,ink);r(-14,-4,28,16,col);r(-14,8,28,4,shade);
        r(-13,-3,4,14,shade);r(9,-3,4,14,shade);line(-7,-2,7,-2,cream,1);r(5,-2,2,4,gold);r(-5,3,10,6,cream);break;
      case 'trophy':
        c.strokeStyle=gold;c.lineWidth=3;c.beginPath();c.moveTo(-9,-11);c.lineTo(-15,-11);c.lineTo(-15,-4);c.quadraticCurveTo(-15,3,-6,3);c.stroke();
        c.beginPath();c.moveTo(9,-11);c.lineTo(15,-11);c.lineTo(15,-4);c.quadraticCurveTo(15,3,6,3);c.stroke();
        poly([[-10,-14],[10,-14],[8,-1],[3,5],[-3,5],[-8,-1]],gold);r(-7,-12,3,10,cream);r(-2,4,4,8,gold);r(-8,12,16,4,wood);r(-6,12,12,2,gold);break;
      case 'dinosaur':
        poly([[-17,7],[-10,3],[-7,-5],[-2,-10],[3,-10],[3,-15],[12,-15],[16,-11],[15,-4],[7,-3],[7,3],[11,8],[9,15],[4,15],[4,8],[-1,8],[-4,15],[-9,15],[-8,6]],jade);
        r(9,-12,2,2,ink);r(9,-5,6,2,cream);line(5,1,10,3,shade,2);poly([[-7,-4],[-9,-8],[-4,-7]],gold);break;
      case 'amphora':
        ring(-8,-1,6,2,gold);ring(8,-1,6,2,gold);poly([[-5,-13],[5,-13],[4,-6],[10,-2],[10,8],[6,14],[-6,14],[-10,8],[-10,-2],[-4,-6]],wood);
        r(-6,-15,12,3,gold);r(-8,1,16,3,gold);r(-5,-3,2,11,cream);break;
      case 'scroll':
        r(-11,-11,22,23,cream);r(-13,-14,27,5,gold);r(-14,10,27,5,gold);disc(12,-11.5,2.5,wood);disc(-12,12.5,2.5,wood);
        for(const y of [-5,0,5])line(-6,y,6,y,wood,1);break;
      case 'romanshield':
        r(-11,-15,22,31,gold);r(-9,-13,18,27,red);line(0,-11,0,11,gold,2);line(-7,0,7,0,gold,2);disc(0,0,4,gold);r(-8,-11,2,21,'#e49a74');break;
      case 'romanhelmet':
        poly([[-12,-10],[-8,-15],[8,-15],[12,-10],[13,4],[-13,4]],gold);r(-11,-1,22,4,wood);
        r(-12,2,6,11,gold);r(6,2,6,11,gold);r(-3,-17,6,14,red);r(-8,-17,16,4,red);r(-8,-9,3,5,cream);break;
      case 'laurel':
        for(const side of [-1,1]){c.save();c.scale(side,1);line(2,14,9,2,jade,2);line(9,2,6,-13,jade,2);for(const [x,y] of [[7,-9],[9,-3],[8,4],[5,10]])poly([[x,y],[x+7,y-5],[x+6,y+2],[x,y+4]],jade);c.restore();}r(-3,12,6,3,gold);break;
      case 'wheat':
        woven();for(const x of [-7,0,7]){line(x,2,x,-13,gold,2);for(const y of [-11,-6]){poly([[x,y],[x-5,y-4],[x-5,y],[x,y+3]],gold);poly([[x,y],[x+5,y-4],[x+5,y],[x,y+3]],cream);}}break;
      case 'standard':
        r(-2,-17,4,34,gold);poly([[-12,-12],[12,-12],[12,7],[0,12],[-12,7]],red);r(-8,-8,16,2,gold);disc(0,-1,4,gold);r(-9,15,18,2,wood);break;
      case 'tunic':
        poly([[-6,-13],[-15,-8],[-12,0],[-8,-2],[-9,14],[9,14],[8,-2],[12,0],[15,-8],[6,-13],[3,-9],[-3,-9]],cream);r(-8,1,16,3,red);r(-5,-10,2,22,gold);r(3,-10,2,22,gold);break;
      case 'lyre':
        poly([[-14,-13],[-8,-13],[-9,5],[-4,10],[4,10],[9,5],[8,-13],[14,-13],[13,8],[7,16],[-7,16],[-13,8]],gold);
        r(-12,-12,24,4,wood);for(const x of [-6,-2,2,6])line(x,-8,x,10,cream,1);break;
      case 'stoneblock':
        poly([[-15,-8],[-7,-14],[15,-10],[15,10],[7,16],[-15,10]],'#b7b8aa');poly([[7,-4],[15,-10],[15,10],[7,16]],shade);line(-15,-8,7,-4,cream,2);line(7,-4,15,-10,cream,1);line(7,-4,7,16,cream,1);break;
      case 'column':
        r(-9,-12,18,26,cream);r(-14,-16,28,5,gold);r(-13,13,26,4,gold);for(const x of [-6,0,6])r(x,-10,2,21,'#c4baa0');break;
      case 'coins':
        for(const [x,y] of [[-8,7],[7,5],[0,-5]]){r(x-7,y-2,14,7,wood);disc(x,y-2,7,gold);ring(x,y-2,4,1,cream);r(x-1,y-4,2,4,wood);}break;
      case 'linen':case 'silkrolls':
        for(let i=0;i<3;i++){const x=-12+i*9,color=kind==='linen'?cream:[col,red,jade][i];r(x,-10+i*2,8,23,color);disc(x+4,-10+i*2,4,color);disc(x+4,-10+i*2,2,shade);r(x+2,-3+i*2,2,13,'#ffffff45');}break;
      case 'basket':woven();ring(0,-5,10,3,wood);r(-13,-3,26,3,gold);break;
      case 'lotus':
        line(0,1,0,16,jade,2);poly([[-13,8],[0,10],[13,8],[7,14],[-7,14]],jade);for(const [x,y] of [[-11,-1],[11,-1],[-6,-6],[6,-6],[0,-10]])poly([[x,y-6],[x+5,y+3],[0,8],[x-5,y+3]],'#f1b9c7');r(-4,4,8,4,gold);break;
      case 'scarab':
        disc(0,1,11,'#73afac');r(-6,-13,12,8,gold);line(0,-5,0,11,gold,2);for(const y of [-5,2,9]){line(-9,y,-15,y+3,gold,2);line(9,y,15,y+3,gold,2);}r(-3,-17,2,5,gold);r(2,-17,2,5,gold);break;
      case 'obelisk':
        poly([[0,-17],[6,-10],[7,13],[-7,13],[-6,-10]],gold);poly([[0,-17],[0,13],[7,13],[6,-10]],wood);r(-11,13,22,4,cream);for(const y of [-6,0,6])r(-4,y,2,3,cream);break;
      case 'sundial':
        disc(0,3,14,gold);ring(0,3,11,1,wood);poly([[0,-14],[0,7],[10,7]],cream);line(0,7,10,10,wood,3);for(const x of [-8,-4,4,8])r(x,12,1,2,cream);break;
      case 'reedboat':case 'longship':
        poly([[-17,6],[-11,14],[10,14],[17,5],[10,8],[-10,8]],wood);line(0,-16,0,10,cream,2);
        poly([[2,-14],[12,-10],[12,2],[2,2]],kind==='longship'?red:cream);line(-13,5,-16,-1,gold,2);line(13,5,16,-1,gold,2);for(const x of [-8,-1,6])disc(x,10,2,kind==='longship'?col:gold);break;
      case 'roundshield':
        disc(0,0,16,shade);disc(0,0,13,wood);for(const x of [-7,0,7])line(x,-11,x,11,gold,1);poly([[-13,-2],[13,-2],[13,2],[-13,2]],red);disc(0,0,5,cream);disc(0,0,3,shade);break;
      case 'barrel':
        poly([[-9,-15],[9,-15],[13,-8],[13,8],[9,15],[-9,15],[-13,8],[-13,-8]],wood);for(const x of [-6,0,6])line(x,-13,x,13,gold,1);r(-12,-9,24,4,shade);r(-12,6,24,4,shade);line(-8,-13,8,-13,cream,1);break;
      case 'vikingaxe':
        line(-8,15,5,-14,wood,4);poly([[0,-11],[10,-16],[17,-9],[13,-1],[4,-5]],'#bed1d2');line(12,-13,15,-7,cream,2);r(-10,12,5,5,gold);break;
      case 'rope':
        ring(0,0,13,4,gold);ring(0,0,7,3,wood);ring(0,0,3,2,gold);line(9,9,16,15,gold,3);break;
      case 'runestone':
        poly([[-9,-14],[5,-17],[12,-10],[13,14],[-13,14],[-12,-7]],shade);line(-7,-9,-7,9,cream,2);line(-7,-8,5,-2,cream,2);line(5,-2,-7,3,cream,2);r(5,5,3,6,gold);break;
      case 'drinkinghorn':
        poly([[-12,-14],[11,-14],[9,-5],[5,3],[-2,10],[-14,15],[-7,7],[-6,-1]],cream);r(-12,-14,23,4,gold);line(4,-7,1,3,wood,1);break;
      case 'fishbasket':woven();poly([[-10,-8],[-5,-13],[9,-10],[14,-14],[13,-3],[9,-7],[-5,-4]],'#a9d4d9');disc(-5,-9,1,ink);line(-3,-9,3,-8,shade,1);break;
      case 'amber':
        line(-8,-17,0,-8,gold,2);line(8,-17,0,-8,gold,2);poly([[0,-9],[11,-2],[9,11],[0,16],[-9,11],[-11,-2]],'#e6a449');poly([[0,-9],[0,16],[-9,11],[-11,-2]],gold);r(-5,-1,3,8,cream);break;
      case 'spices':
        for(const [x,y,color] of [[-8,3,'#d58353'],[7,6,gold]]){poly([[x-5,y-13],[x+5,y-13],[x+8,y-4],[x+7,y+10],[x-7,y+10],[x-8,y-4]],wood);r(x-5,y-12,10,3,cream);disc(x,y-2,5,color);r(x-5,y+6,10,2,gold);}break;
      case 'rug':
        r(-12,-13,24,27,red);r(-9,-10,18,21,gold);r(-7,-8,14,17,col);poly([[0,-6],[5,1],[0,8],[-5,1]],cream);for(const x of [-9,-3,3,9])line(x,14,x,17,gold,1);break;
      case 'porcelain':
        poly([[-16,-5],[16,-5],[11,10],[5,14],[-5,14],[-11,10]],cream);line(-14,-3,14,-3,col,2);line(-10,7,10,7,col,2);r(-6,14,12,3,col);for(const x of [-7,0,7])disc(x,2,1.5,col);break;
      case 'paperfan':
        poly([[0,11],[-17,-2],[-13,-12],[0,-17],[13,-12],[17,-2]],col);for(const [x,y] of [[-15,-3],[-11,-10],[0,-15],[11,-10],[15,-3]])line(0,11,x,y,cream,1);r(-2,9,4,8,wood);break;
      case 'jade':
        line(-10,-16,0,-7,gold,1);line(10,-16,0,-7,gold,1);ring(0,3,10,6,jade);line(-7,-1,-5,-3,cream,2);r(-2,13,4,4,gold);break;
      case 'seal':
        r(-5,-15,10,14,jade);r(-10,-1,20,5,wood);r(-13,5,26,10,gold);r(-9,8,18,4,red);r(-5,9,3,2,cream);r(2,9,3,2,cream);break;
      case 'abacus':
        r(-16,-13,32,28,wood);r(-12,-9,24,20,ink);for(const x of [-8,0,8]){line(x,-9,x,11,cream,1);for(const y of [-5,3,7])r(x-3,y,6,3,x?gold:jade);}break;
    }
    return true;
  }
  root.DockDashCargoArt={draw,kinds};
})(typeof globalThis!=='undefined'?globalThis:this);
