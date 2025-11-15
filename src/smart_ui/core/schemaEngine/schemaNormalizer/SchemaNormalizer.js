function dbTypeToUiType(t=""){
  t=t.toLowerCase();
  if(t.includes("date")||t.includes("time")) return "date";
  if(t.includes("int")||t.includes("numeric")||t.includes("decimal")) return "number";
  if(t.includes("bytea")) return "file";
  if(t.includes("bool")) return "boolean";
  if(t.includes("text")||t.includes("char")) return "text";
  return "text";
}

export function normalizeAllSchemas(rawData){
  const out={};
  for(const [key,val] of Object.entries(rawData||{})){
    if(!val) continue;
    const table = val.table || key;
    const cols = Array.isArray(val.columns)? val.columns: [];
    const obj = val.object||{};
    const columns = cols.map(c=>({
      name:c.column_name,
      db_type:c.data_type,
      nullable:c.is_nullable==="YES",
      default:c.column_default??null,
      comment:c.comment||null,
      ui_type:dbTypeToUiType(c.data_type),
      required:c.is_nullable!=="YES"
    }));
    const fields = columns.map(c=>c.name);
    const template={};
    fields.forEach(f=> template[f]= obj[f]!==undefined? obj[f] : "");
    out[table]={
      tableName:table,
      columns,
      fields,
      objectTemplate:template,
      meta:{ totalColumns:columns.length }
    };
  }
  return out;
}
