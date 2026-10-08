const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),MR=require('../missions/mission-rules.js');
test('every world has a distinct, compact preview from its unchanged original painting',()=>{
 const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/previews/manifest.json'),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
 assert.deepEqual([manifest.width,manifest.height,manifest.top],[360,180,170]);assert.equal(manifest.images.length,MR.worlds.length);
 const media=JSON.parse(fs.readFileSync(path.join(root,'index.html'),'utf8').match(/<script[^>]*id="bundled-media"[^>]*>([\s\S]*?)<\/script>/)[1]),previews=new Set();let originalBytes=0,previewBytes=0;
 for(const world of MR.worlds){
  const row=manifest.images.find(r=>r.location===world.location);assert.ok(row,world.id);assert.equal(row.source,media.floors[world.location]);if(world.backdrop)assert.equal(row.source,world.backdrop);
  const original=fs.readFileSync(path.join(root,row.source)),preview=fs.readFileSync(path.join(root,'assets/previews',row.preview));assert.equal(hash(original),row.sourceSHA256);assert.equal(hash(preview),row.previewSHA256);
  assert.equal(preview.toString('ascii',0,4),'RIFF');assert.equal(preview.toString('ascii',8,12),'WEBP');assert.equal(preview.toString('ascii',12,16),'VP8 ');assert.deepEqual([preview.readUInt16LE(26)&0x3fff,preview.readUInt16LE(28)&0x3fff],[360,180]);
  assert.ok(preview.length<64*1024,world.id);previews.add(row.previewSHA256);originalBytes+=original.length;previewBytes+=preview.length;
 }
 assert.equal(previews.size,177);assert.ok(previewBytes<originalBytes*.2,{originalBytes,previewBytes});
});
