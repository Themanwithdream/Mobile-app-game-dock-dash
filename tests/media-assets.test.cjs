const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),metadata=require('../audio/mission-music.json');
test('all hundred composed mission loops retain their complete encoded bytes',()=>{
  assert.equal(metadata.length,100);
  for(const m of metadata){assert.equal(fs.statSync(path.join(root,'audio',m.file)).size,m.bytes,m.file);assert.ok(m.duration_seconds>60);}
});
test('media has exactly one scene and track for each route and mission world',()=>{
  const source=fs.readFileSync(path.join(root,'index.html'),'utf8'),media=JSON.parse(source.match(/id="bundled-media">(.*?)<\/script>/)[1]),worlds=require('../missions/mission-rules.js').worlds;
  assert.equal(media.floors.length,worlds.length+3);assert.equal(media.music.length,worlds.length+3);
  for(const src of [...media.floors,...media.music])if(src && src.startsWith('./'))assert.ok(fs.existsSync(path.join(root,src)),src);
  for(const w of worlds)assert.equal(media.floors[w.location],w.backdrop||'./assets/missions/'+w.id+'.png');
});
test('every world has exclusive scenery rather than shared images under different stories',()=>{
  const crypto=require('node:crypto'),source=fs.readFileSync(path.join(root,'index.html'),'utf8'),media=JSON.parse(source.match(/id="bundled-media">(.*?)<\/script>/)[1]),worlds=require('../missions/mission-rules.js').worlds;
  const files=worlds.map(w=>media.floors[w.location]);
  assert.equal(new Set(files).size,100,'Two worlds share a backdrop URL');
  const hashes=files.map(src=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,src))).digest('hex'));
  assert.equal(new Set(hashes).size,100,'Two worlds use identical backdrop pixels');
  for(const w of worlds.filter(w=>w.backdrop)){
    const data=fs.readFileSync(path.join(root,w.backdrop));
    assert.equal(data.readUInt32BE(16),360,w.id+' image width exceeds the phone art budget');
    assert.equal(data.readUInt32BE(20),640,w.id+' image height exceeds the phone art budget');
    assert.ok(data.length<240000,w.id+' image download exceeds the per-world art budget');
  }
});
