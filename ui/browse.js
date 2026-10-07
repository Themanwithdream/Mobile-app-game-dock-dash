/* Small, shared search for mission worlds and the coin shop. */
(function(root){
  'use strict';
  const normalise=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  function find(items,query,fields){
    const terms=normalise(query).split(' ').filter(Boolean);
    if(!terms.length)return items;
    return items.filter(item=>{const haystack=normalise(fields(item).filter(Boolean).join(' '));return terms.every(term=>haystack.includes(term));});
  }
  const api={normalise,find};root.DockDashBrowse=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
