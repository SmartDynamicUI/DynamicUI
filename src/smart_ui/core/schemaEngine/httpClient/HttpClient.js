async function handleResponse(res){
  if(!res.ok){
    const t = await res.text().catch(()=> "");
    throw new Error(`HTTP ${res.status}: ${res.statusText} ${t}`);
  }
  const ct = res.headers.get("content-type")||"";
  if(ct.includes("application/json")) return res.json();
  return res.text();
}

export async function httpGet(url,opts={}){
  const res = await fetch(url,{method:"GET",...opts});
  return handleResponse(res);
}
