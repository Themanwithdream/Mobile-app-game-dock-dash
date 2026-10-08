/* Small, original restaurant, city, sports, maker and prism cargo silhouettes. */
(function(root){
  'use strict';
  const kinds=['burger','fries','milkshake','pizzaslice','soupbowl','chefhat','coffeepot','menu','cutlery','saucebottle','takeaway','plate','croissant','breadloaf','layercake','donut','rollingpin','floursack','whisk','baguette','butter','transitticket','mailbundle','toolbox','trafficlight','bikehelmet','coffeecup','newspaper','bouquet','fruitcrate','paintcan','umbrella','wateringcan','flightvisor','heroshield','jetboots','wingpack','beacon','drone','target','powercell','herobadge','basketball','tennisracket','baseballmitt','volleyball','shuttlecock','medal','scoreboard','hockeystick','goggles','hardhat','brickstack','cementsack','blueprint','steelbeam','tapemeasure','workboot','drill','safetyvest','microchip','sensor','robotarm','circuitboard','vrheadset','serverdrive','solartile','cablereel','robotkit','prismring','facetedgem','prismbracelet','jewellertool','crystalingot','ringbox','gemscale','lightprism','ringmould','colourchart'];
  kinds.push('pipe','icecream','wafercone');
  const colourKinds=['prismring','facetedgem','prismbracelet','crystalingot','ringbox','lightprism'];
  function draw(c,kind,col){
    if(!kinds.includes(kind))return false;
    const cream='#fff1d1',ink='#172c38',shade='#456171',gold='#eabe66',wood='#ae774e',red='#d97867',mint='#92cfaa';
    const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    const poly=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
    const line=(x,y,a,b,color,w=2)=>{c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
    const disc=(x,y,radius,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.fill();};
    const ring=(x,y,radius,width,color)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.stroke();};
    const gem=(x,y,size=12)=>{poly([[x,y-size],[x+size,y],[x,y+size],[x-size,y]],col);poly([[x,y-size],[x,y+size],[x-size,y]],'#ffffff35');line(x-size,y,x,y-size,cream,1);};
    const handle=()=>{ring(0,-8,6,3,shade);};
    const sack=(label)=>{poly([[-11,-15],[11,-15],[9,-8],[15,12],[11,16],[-11,16],[-15,12],[-9,-8]],cream);r(-10,-13,20,3,wood);r(-9,-3,18,13,col);if(label)line(-5,2,5,2,cream,2);};
    switch(kind){
      case 'pipe':
        poly([[-14,-13],[0,-13],[0,2],[14,2],[14,14],[-12,14],[-14,12]],shade);r(-11,-11,8,20,cream);r(-11,5,22,6,cream);r(-17,-16,20,5,col);r(12,-1,5,18,col);break;
      case 'icecream':
        r(-15,-5,30,21,col);r(-17,-7,34,5,cream);disc(-8,-10,7,'#e5aab7');disc(7,-11,7,gold);disc(0,-16,7,cream);r(-9,1,18,9,cream);disc(0,5,3,col);break;
      case 'wafercone':
        poly([[-11,-3],[11,-3],[0,19]],gold);line(-7,1,4,10,wood,1);line(7,1,-4,10,wood,1);disc(0,-8,12,cream);disc(-4,-11,3,'#ffffff');r(-13,-4,26,4,col);break;
      case 'burger':
        poly([[-15,-6],[-13,-12],[-7,-16],[7,-16],[13,-12],[15,-6]],gold);for(const [x,y] of [[-7,-11],[1,-13],[8,-10]])r(x,y,3,1,cream);
        r(-16,-5,32,4,mint);poly([[-15,-1],[15,-1],[11,5],[0,3],[-10,5]],gold);r(-15,3,30,6,wood);r(-14,10,28,5,gold);break;
      case 'fries':
        for(const [x,y] of [[-11,-14],[-6,-17],[-1,-13],[4,-16],[9,-11]]){r(x,y,4,23,gold);r(x,y,1,20,cream);}
        poly([[-15,-1],[15,-1],[12,15],[-12,15]],red);r(-9,3,18,4,col);break;
      case 'milkshake':case 'coffeecup':
        if(kind==='milkshake'){line(5,-16,8,-20,col,3);disc(-5,-8,6,cream);disc(4,-9,7,cream);r(-12,-5,24,4,cream);}
        else{r(-13,-13,26,4,ink);r(-11,-17,22,5,cream);}
        poly([[-12,-8],[12,-8],[9,16],[-9,16]],col);r(-5,-3,10,13,cream);r(-10,-9,20,3,cream);break;
      case 'pizzaslice':
        poly([[-15,-13],[15,-13],[0,17]],gold);line(-15,-13,15,-13,wood,6);poly([[-10,-9],[10,-9],[0,11]],'#ffe6a0');for(const [x,y] of [[-4,-4],[5,-5],[0,4]])disc(x,y,3,red);break;
      case 'soupbowl':case 'plate':
        disc(0,0,16,shade);disc(0,-2,14,cream);disc(0,-2,10,kind==='plate'?col:'#d98e52');
        if(kind==='soupbowl'){for(const [x,y] of [[-5,-5],[4,-2],[-1,3]])r(x,y,3,2,mint);r(-10,12,20,3,cream);}else ring(0,-2,12,1,gold);break;
      case 'chefhat':
        for(const [x,y] of [[-10,-7],[0,-12],[10,-7]])disc(x,y,8,cream);r(-11,-4,22,19,cream);r(-11,9,22,6,col);for(const x of [-5,4])line(x,-3,x,7,'#c6c6b2',1);break;
      case 'coffeepot':
        ring(9,0,8,3,shade);poly([[-10,-7],[8,-7],[12,11],[8,15],[-12,15],[-14,10]],cream);r(-10,-6,17,17,wood);r(-12,-11,22,5,shade);r(-6,-16,10,5,col);r(-9,-3,3,10,cream);break;
      case 'menu':case 'newspaper':
        r(-14,-16,28,32,cream);r(-11,-13,22,5,kind==='menu'?col:shade);for(const y of [-3,2,7,12]){line(-10,y,-1,y,shade,1);line(3,y,10,y,shade,1);}if(kind==='newspaper')r(-10,-6,8,6,col);break;
      case 'cutlery':
        for(const x of [-12,-9,-6])r(x,-15,2,10,cream);r(-12,-7,8,4,cream);r(-9,-3,3,20,col);poly([[7,-16],[13,-16],[13,3],[10,5],[10,17],[6,17],[6,3]],cream);r(6,7,4,10,col);break;
      case 'saucebottle':
        r(-4,-17,8,7,cream);poly([[-6,-10],[6,-10],[9,-4],[9,16],[-9,16],[-9,-4]],red);r(-7,0,14,10,cream);disc(0,5,3,col);r(-6,-6,2,5,'#ffffff66');break;
      case 'takeaway':
        ring(0,-6,7,2,wood);poly([[-13,-8],[13,-8],[16,15],[-16,15]],gold);r(-6,-2,12,11,col);r(-15,12,30,3,wood);break;
      case 'croissant':
        poly([[-17,8],[-14,-2],[-9,-10],[-2,-14],[8,-11],[14,-2],[17,9],[9,5],[7,0],[2,-3],[-3,-3],[-8,2],[-9,6]],gold);
        for(const [x,y,a,b] of [[-10,-6,-5,-1],[-3,-11,-1,-4],[5,-8,3,-3],[11,-2,6,1]])line(x,y,a,b,wood,2);line(-9,-8,-4,-11,cream,2);break;
      case 'breadloaf':case 'baguette':
        c.save();if(kind==='baguette')c.rotate(-.5);poly([[-12,-14],[8,-16],[13,-12],[13,12],[8,16],[-8,16],[-13,11],[-13,-9]],gold);
        r(8,-10,4,20,wood);for(const y of [-9,-1,7])line(-7,y,4,y-3,cream,3);c.restore();break;
      case 'layercake':
        r(-14,-2,28,18,gold);r(-14,3,28,4,cream);r(-14,11,28,4,cream);r(-16,-5,32,6,col);r(-10,-13,20,8,cream);disc(0,-14,3,red);break;
      case 'donut':
        disc(0,0,16,wood);disc(0,-1,14,col);disc(0,0,6,ink);disc(0,0,4,shade);for(const [x,y] of [[-8,-7],[7,-8],[10,4],[-8,7]])r(x,y,3,2,cream);break;
      case 'rollingpin':
        line(-17,0,17,0,wood,5);r(-11,-7,22,14,gold);r(-9,-5,18,3,cream);r(-15,-3,4,6,wood);r(11,-3,4,6,wood);break;
      case 'floursack':case 'cementsack':sack(true);if(kind==='floursack'){line(0,-1,0,8,gold,2);for(const y of [0,4]){line(-4,y,0,y+3,gold,2);line(4,y,0,y+3,gold,2);}}break;
      case 'whisk':
        for(const x of [-8,0,8]){c.strokeStyle=cream;c.lineWidth=2;c.beginPath();c.moveTo(0,2);c.quadraticCurveTo(x-9,-16,0,-16);c.quadraticCurveTo(x+9,-16,0,2);c.stroke();}r(-3,1,6,16,col);break;
      case 'butter':
        poly([[-15,-7],[-7,-13],[14,-10],[14,11],[-15,11]],cream);r(-11,-6,23,14,gold);poly([[4,-6],[12,-10],[12,8],[4,12]],wood);break;
      case 'transitticket':
        r(-17,-10,34,20,cream);r(-13,-7,18,14,col);for(const y of [-7,-3,1,5])r(9,y,5,2,shade);for(const y of [-6,-1,4])r(5,y,1,2,wood);break;
      case 'mailbundle':
        for(let i=2;i>=0;i--){const y=i*3;r(-15,-12+y,30,19,cream);line(-15,-12+y,0,-1+y,wood,1);line(15,-12+y,0,-1+y,wood,1);}r(-2,-12,4,27,col);break;
      case 'toolbox':
        handle();r(-16,-5,32,21,col);r(-16,-5,32,7,shade);r(-3,0,6,5,gold);r(-13,10,26,3,'#ffffff33');break;
      case 'trafficlight':
        r(-7,-18,14,33,ink);for(const [y,color] of [[-11,red],[-1,gold],[9,mint]])disc(0,y,4,color);r(-2,15,4,4,shade);break;
      case 'bikehelmet':case 'hardhat':
        disc(0,0,14,kind==='hardhat'?gold:col);r(-17,6,34,5,kind==='hardhat'?wood:shade);r(-3,-14,6,20,cream);
        if(kind==='bikehelmet')for(const x of [-9,7])r(x,-5,3,6,ink);else r(-13,0,26,2,'#ffe9ab');break;
      case 'bouquet':
        poly([[-13,-3],[13,-3],[5,17],[-5,17]],cream);for(const [x,y,color] of [[-8,-9,red],[6,-10,col],[0,-15,gold]]){disc(x,y,6,color);disc(x,y,2,cream);}r(-5,8,10,3,mint);break;
      case 'fruitcrate':
        r(-16,-5,32,22,wood);r(-13,0,26,12,gold);for(const x of [-9,0,9]){disc(x,-7,6,x===0?mint:red);r(x,-15,2,4,mint);}for(const y of [3,10])r(-13,y,26,2,wood);break;
      case 'paintcan':
        handle();r(-11,-7,22,23,shade);r(-9,-5,18,17,col);r(-13,-9,26,4,cream);r(-11,13,22,3,cream);r(-3,-3,6,9,'#ffffff88');break;
      case 'umbrella':
        line(0,-6,0,12,cream,2);line(0,12,5,16,cream,2);poly([[-17,-4],[-12,-12],[0,-17],[12,-12],[17,-4],[8,-7],[0,-4],[-8,-7]],col);line(0,-17,8,-7,cream,1);line(0,-17,-8,-7,cream,1);break;
      case 'wateringcan':
        ring(9,2,8,3,col);poly([[-13,-3],[7,-3],[9,14],[-13,14]],col);poly([[-13,2],[-17,-8],[-21,-7],[-17,8]],shade);ring(-2,-6,7,2,cream);r(-8,3,3,7,cream);break;
      case 'flightvisor':case 'vrheadset':case 'goggles':
        r(-17,-7,34,14,shade);r(-14,-10,28,21,cream);r(-12,-7,24,13,col);r(-9,-5,8,4,'#ffffff88');
        if(kind==='goggles'){r(-2,-7,4,14,cream);r(-16,-5,3,10,ink);r(13,-5,3,10,ink);}else r(-9,11,18,3,ink);break;
      case 'heroshield':case 'herobadge':
        poly([[-13,-14],[13,-14],[14,3],[0,17],[-14,3]],cream);poly([[-10,-11],[10,-11],[10,2],[0,13],[-10,2]],col);poly([[0,-8],[7,0],[0,7],[-7,0]],gold);break;
      case 'jetboots':case 'workboot':
        for(const x of [-13,2]){r(x,-14,11,22,col);r(x,-11,3,7,shade);poly([[x,5],[x+10,5],[x+14,10],[x+13,15],[x,15]],col);r(x,14,13,3,ink);if(kind==='jetboots'){r(x+2,9,7,3,cream);poly([[x+2,17],[x+8,17],[x+5,21]],gold);}}break;
      case 'wingpack':
        poly([[-5,-10],[-17,-16],[-14,5],[-6,11],[-3,3],[3,3],[6,11],[14,5],[17,-16],[5,-10]],col);r(-5,-12,10,25,cream);r(-3,-8,6,17,shade);line(-13,-11,-9,3,cream,1);line(13,-11,9,3,cream,1);break;
      case 'beacon':
        r(-10,-9,20,21,col);r(-13,11,26,5,shade);r(-7,-13,14,5,cream);line(0,-21,0,-17,gold,2);line(-17,-11,-13,-9,gold,2);line(17,-11,13,-9,gold,2);r(-6,-5,3,12,cream);break;
      case 'drone':
        for(const [x,y] of [[-12,-12],[12,-12],[-12,12],[12,12]]){line(0,0,x,y,shade,3);ring(x,y,6,2,cream);line(x-4,y,x+4,y,col,2);}r(-7,-6,14,12,col);disc(0,0,3,ink);break;
      case 'target':
        disc(0,0,16,cream);disc(0,0,12,red);disc(0,0,8,cream);disc(0,0,4,col);break;
      case 'powercell':
        r(-6,-17,12,4,shade);r(-10,-13,20,28,col);r(-7,-10,14,20,ink);poly([[1,-8],[-4,1],[1,1],[-1,9],[5,-1],[0,-1]],gold);r(-9,12,18,3,cream);break;
      case 'basketball':
        disc(0,0,16,ink);disc(0,0,14.5,'#e6a268');line(-14,0,14,0,wood,2);line(0,-14,0,14,wood,2);
        for(const side of [-1,1]){c.strokeStyle=wood;c.lineWidth=2;c.beginPath();c.moveTo(side*9,-11);c.quadraticCurveTo(side*1,0,side*9,11);c.stroke();}break;
      case 'tennisracket':
        c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.ellipse(-3,-6,10,13,-.3,0,Math.PI*2);c.stroke();
        for(const x of [-9,-4,1,5])line(x,-14,x,-1,cream,1);for(const y of [-12,-7,-2])line(-10,y,4,y,cream,1);line(0,5,9,18,shade,4);line(5,12,9,18,col,5);break;
      case 'baseballmitt':
        poly([[-13,-12],[-6,-15],[-2,-14],[3,-17],[8,-16],[12,-12],[14,-5],[16,3],[11,13],[2,16],[-9,12],[-16,3],[-16,-4],[-12,-5],[-7,2],[-6,-4]],wood);
        ring(2,4,7,2,gold);for(const x of [-4,2,8])line(x,-11,x,-3,gold,1.5);line(-11,5,-6,10,cream,1);break;
      case 'volleyball':
        disc(0,0,16,shade);disc(0,0,14.5,cream);for(let i=0;i<3;i++){c.save();c.rotate(i*Math.PI*2/3);poly([[0,-14],[8,-10],[13,-3],[1,-2],[-5,-5]],col);line(0,0,0,-14,shade,1);c.restore();}break;
      case 'shuttlecock':
        poly([[-15,-15],[15,-15],[6,9],[-6,9]],cream);for(const x of [-10,-4,4,10])line(x,-13,x*.4,7,shade,1);disc(0,10,6,gold);r(-6,7,12,4,col);break;
      case 'medal':
        poly([[-10,-17],[-2,-17],[4,0],[-5,2]],col);poly([[2,-17],[10,-17],[5,2],[-4,0]],red);disc(0,6,11,gold);ring(0,6,8,1,cream);poly([[0,-1],[4,6],[0,12],[-4,6]],cream);break;
      case 'scoreboard':
        r(-17,-13,34,25,shade);r(-14,-10,28,18,ink);for(const x of [-10,4]){r(x,-6,6,2,gold);r(x,-1,6,2,gold);r(x,4,6,2,gold);r(x,-5,2,10,gold);r(x+4,-5,2,10,gold);}r(-11,12,4,5,col);r(7,12,4,5,col);break;
      case 'hockeystick':
        line(-4,-17,-4,9,wood,4);line(-4,9,14,13,wood,5);for(const x of [-8,-3,2])r(x,10,2,5,cream);disc(9,-8,6,ink);r(4,-9,10,2,shade);break;
      case 'brickstack':
        for(const [x,y] of [[-15,-9],[1,-9],[-7,-16],[-15,1],[1,1],[-7,10]]){r(x,y,14,7,red);r(x+1,y+1,11,2,gold);}break;
      case 'blueprint':
        r(-15,-14,30,28,'#508caa');for(const x of [-10,0,10])line(x,-12,x,12,'#a9dce4',1);for(const y of [-8,0,8])line(-13,y,13,y,'#a9dce4',1);r(-11,-8,10,15,cream);r(-9,-6,6,11,'#508caa');r(2,2,10,6,cream);break;
      case 'steelbeam':
        poly([[-14,-16],[-5,-16],[-5,-9],[5,-9],[5,-16],[14,-16],[14,16],[5,16],[5,9],[-5,9],[-5,16],[-14,16]],shade);r(-11,-13,3,26,cream);r(-5,-6,10,12,col);break;
      case 'tapemeasure':
        r(-14,-10,25,25,col);r(-10,-7,17,15,ink);disc(-2,1,5,gold);r(10,7,9,4,cream);for(const x of [11,15])r(x,7,1,2,shade);r(17,5,3,8,shade);break;
      case 'drill':
        r(-16,-10,27,13,col);r(-15,-8,5,9,ink);r(10,-7,6,5,shade);line(16,-5,22,-5,cream,2);poly([[-6,3],[4,3],[8,15],[-3,15]],shade);r(-7,14,19,5,col);r(0,-7,7,3,cream);break;
      case 'safetyvest':
        poly([[-9,-15],[-3,-15],[0,-7],[3,-15],[9,-15],[14,-10],[11,16],[-11,16],[-14,-10]],gold);r(-10,3,20,4,cream);r(-7,-11,3,24,cream);r(4,-11,3,24,cream);r(-1,-4,2,20,wood);break;
      case 'microchip':
        for(let i=-10;i<=10;i+=5){r(i,-17,2,5,gold);r(i,12,2,5,gold);r(-17,i,5,2,gold);r(12,i,5,2,gold);}r(-12,-12,24,24,shade);r(-8,-8,16,16,col);r(-5,-5,10,10,ink);r(-3,-3,3,3,cream);break;
      case 'sensor':
        r(-14,-13,28,27,cream);disc(0,-1,11,shade);disc(0,-1,8,col);disc(0,-1,4,ink);disc(-3,-4,2,cream);r(-10,14,4,4,gold);r(6,14,4,4,gold);break;
      case 'robotarm':
        r(-14,12,28,5,shade);line(-7,10,-7,-4,col,7);disc(-7,-4,5,cream);line(-7,-4,7,-13,col,6);disc(7,-13,4,shade);line(7,-13,15,-9,cream,3);line(15,-9,19,-13,cream,2);line(15,-9,18,-4,cream,2);break;
      case 'circuitboard':
        r(-15,-15,30,30,'#559784');r(-6,-7,12,14,ink);for(const [x,y] of [[-11,-10],[7,-11],[-11,9],[9,9]]){r(x,y,4,4,gold);line(x+2,y+2,0,0,col,1);}r(-3,-3,6,6,cream);break;
      case 'serverdrive':
        r(-13,-16,26,32,shade);for(const y of [-12,-3,6]){r(-10,y,20,7,cream);r(-8,y+2,11,3,ink);r(6,y+2,2,2,mint);}break;
      case 'solartile':
        r(-16,-14,32,28,cream);r(-13,-11,26,22,'#487ca6');for(const x of [-6,3])line(x,-10,x,10,col,1);for(const y of [-4,4])line(-12,y,12,y,col,1);break;
      case 'cablereel':
        disc(0,0,16,shade);ring(0,0,11,4,col);ring(0,0,6,3,ink);disc(0,0,3,gold);line(11,11,18,16,col,3);r(15,14,5,5,cream);break;
      case 'robotkit':
        line(0,-20,0,-13,shade,2);disc(0,-20,2,col);r(-12,-13,24,14,cream);r(-8,-9,5,5,col);r(3,-9,5,5,col);r(-5,1,10,4,shade);r(-11,5,22,11,col);r(-16,6,4,8,cream);r(12,6,4,8,cream);r(-9,16,6,4,shade);r(3,16,6,4,shade);break;
      case 'prismring':case 'prismbracelet':
        ring(0,4,kind==='prismring'?11:14,5,shade);ring(0,3,kind==='prismring'?11:14,3,col);gem(0,-8,7);line(-8,5,-5,9,cream,2);break;
      case 'facetedgem':gem(0,0,16);line(-16,0,16,0,'#ffffff55',1);line(0,-16,7,0,cream,1);break;
      case 'jewellertool':
        line(-11,17,4,-9,wood,4);poly([[-1,-12],[5,-17],[14,-8],[9,-2]],cream);line(11,17,4,-9,shade,3);line(11,17,16,12,col,3);break;
      case 'crystalingot':
        poly([[-16,-6],[-6,-13],[15,-8],[16,9],[6,15],[-15,10]],col);poly([[6,-2],[15,-8],[16,9],[6,15]],shade);line(-16,-6,6,-2,cream,2);line(6,-2,15,-8,cream,1);break;
      case 'ringbox':
        poly([[-14,-13],[14,-13],[14,1],[-14,1]],col);r(-12,-10,24,8,shade);r(-15,1,30,15,col);r(-12,4,24,9,ink);ring(0,8,5,2,cream);gem(0,3,3);break;
      case 'gemscale':
        r(-2,-17,4,31,gold);r(-12,14,24,3,wood);line(-14,-10,14,-10,gold,2);for(const x of [-11,11]){line(x,-10,x,1,gold,1);poly([[x-7,1],[x+7,1],[x+4,6],[x-4,6]],cream);}gem(-11,-2,3);break;
      case 'lightprism':
        poly([[0,-17],[16,13],[-16,13]],col);poly([[0,-17],[0,13],[-16,13]],'#ffffff45');line(-16,13,0,-17,cream,2);line(-20,-3,-8,-3,gold,2);for(const [y,color] of [[-1,red],[3,mint],[7,'#91cfff']])line(10,y,20,y+2,color,2);break;
      case 'ringmould':
        r(-15,-15,30,30,shade);ring(0,2,9,4,ink);poly([[0,-12],[6,-6],[0,0],[-6,-6]],ink);r(-12,-12,3,3,cream);r(9,9,3,3,gold);break;
      case 'colourchart':
        r(-15,-15,30,30,cream);for(const [x,y,color] of [[-11,-11,red],[2,-11,'#91cfff'],[-11,2,mint],[2,2,gold]])r(x,y,9,9,color);break;
    }
    return true;
  }
  root.DockDashExpansionArt={kinds,colourKinds,draw};
})(typeof globalThis!=='undefined'?globalThis:this);
