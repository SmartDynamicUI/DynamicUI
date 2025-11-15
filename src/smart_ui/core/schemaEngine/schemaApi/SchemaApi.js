import { httpGet } from "../httpClient/HttpClient.js";

export async function fetchAllSchemas(endpoint){
  const json = await httpGet(endpoint);
  if(!json || json.success!==true || !json.data)
    throw new Error("Invalid schema response");
  return json.data;
}
