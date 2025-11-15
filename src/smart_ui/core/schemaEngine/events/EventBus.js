const listeners = new Map();

export function on(ev,fn){
  if(!listeners.has(ev)) listeners.set(ev,new Set());
  listeners.get(ev).add(fn);
  return ()=> off(ev,fn);
}

export function off(ev,fn){
  const set=listeners.get(ev);
  if(set) set.delete(fn);
}

export function emit(ev,payload){
  const set=listeners.get(ev);
  if(!set) return;
  for(const fn of Array.from(set)){
    try{ fn(payload);}catch(e){ console.error(e); }
  }
}
