import { memoryCache } from "../schemaCache/SchemaCache.js";

function req(tbl){
  const sc = memoryCache.schemas[tbl];
  if(!sc) throw new Error("Schema not found: "+tbl);
  return sc;
}

export const getSchemaInternal = (t)=> req(t);
export const getColumnsInternal = (t)=> req(t).columns;
export const getObjectTemplateInternal = (t)=> req(t).objectTemplate;
export const getFieldsInternal = (t)=> req(t).fields;
