export const memoryCache={ schemas:{} };

const LS_PREFIX="schemas.";
const LS_TABLES_KEY="schemas.__tables";
const LS_LAST_UPDATED="schemas.lastUpdated";

function hasLS(){ try{ return typeof window!=='undefined' && window.localStorage;}catch{return false;} }

export function saveAllToCache(normalized){
  memoryCache.schemas={};
  const tables=[];
  for(const [tbl,sch] of Object.entries(normalized)){
    memoryCache.schemas[tbl]=sch;
    tables.push(tbl);
    if(hasLS()) window.localStorage.setItem(LS_PREFIX+tbl,JSON.stringify(sch));
  }
  if(hasLS()) window.localStorage.setItem(LS_TABLES_KEY,JSON.stringify(tables));
}

export function loadFromLocal(){
  if(!hasLS()) return false;
  let tables=[];
  try{
    tables=JSON.parse(window.localStorage.getItem(LS_TABLES_KEY)||"[]");
  }catch{}
  const loaded={};
  for(const t of tables){
    try{
      const raw=window.localStorage.getItem(LS_PREFIX+t);
      if(raw) loaded[t]=JSON.parse(raw);
    }catch{}
  }
  if(Object.keys(loaded).length){
    memoryCache.schemas=loaded;
    return true;
  }
  return false;
}

export function getLastUpdated(){
  if(!hasLS()) return null;
  const v = Number(window.localStorage.getItem(LS_LAST_UPDATED)||"");
  return Number.isNaN(v)? null : v;
}

export function setLastUpdated(ts){
  if(hasLS()) window.localStorage.setItem(LS_LAST_UPDATED,String(ts));
}
