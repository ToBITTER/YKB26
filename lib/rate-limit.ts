const attempts=new Map<string,{count:number;reset:number}>();
export function allow(key:string,limit=8,windowMs=15*60_000){const now=Date.now(),entry=attempts.get(key);if(!entry||entry.reset<=now){attempts.set(key,{count:1,reset:now+windowMs});return true}if(entry.count>=limit)return false;entry.count++;return true}

