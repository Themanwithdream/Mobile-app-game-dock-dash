const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),metadata=require('../audio/mission-music.json');
test('all fourteen composed mission loops retain their complete encoded bytes',()=>{
  assert.equal(metadata.length,14);
  for(const m of metadata){assert.equal(fs.statSync(path.join(root,'audio',m.file)).size,m.bytes,m.file);assert.ok(m.duration_seconds>60);}
});
test('media has exactly one scene and track for each route and mission world',()=>{
  const source=fs.readFileSync(path.join(root,'index.html'),'utf8'),media=JSON.parse(source.match(/id="bundled-media">(.*?)<\/script>/)[1]),worlds=require('../missions/mission-rules.js').worlds;
  assert.equal(media.floors.length,worlds.length+3);assert.equal(media.music.length,worlds.length+3);
  for(const src of [...media.floors,...media.music])if(src && src.startsWith('./'))assert.ok(fs.existsSync(path.join(root,src)),src);
  for(const w of worlds)assert.equal(media.floors[w.location],'./assets/missions/'+w.id+'.png');
});
