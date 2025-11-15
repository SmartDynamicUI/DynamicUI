export const TWELVE_HOURS_MS = 12*60*60*1000;

export const nowTimestamp = ()=> Date.now();

export function isExpired(last,ttl=TWELVE_HOURS_MS){
  if(!last) return true;
  return nowTimestamp()-last > ttl;
}
