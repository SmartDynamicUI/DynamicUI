
export function mapDbTypeToUi(dbType, columnName = "") {
  if (!dbType) return { type: "string", filter: "text" };

  const t = dbType.toLowerCase();

  if (t.includes("int") || t.includes("numeric") || t.includes("decimal")) {
    return { type: "number", filter: "numberRange" };
  }

  if (t.includes("date") || t.includes("time")) {
    return { type: "date", filter: "dateRange" };
  }

  if (t.includes("bool")) {
    return { type: "boolean", filter: "boolean" };
  }

  const cn = columnName.toLowerCase();
  if (cn.includes("photo") || cn.includes("image") || cn.includes("file")) {
    return { type: "image", filter: null };
  }

  if (t.includes("char") || t.includes("text") || t.includes("uuid")) {
    return { type: "string", filter: "text" };
  }

  if (t.includes("json")) {
    return { type: "json", filter: null };
  }

  return { type: "string", filter: "text" };
}
