import { mapDbTypeToUi } from "./typeMapper.js";
import { createColumn } from "./columnFactory.js";

export function buildColumns({
  tableSchema,
  FieldsShow = [],
  roles = [],
  currentUserRoles = [],
  actions = [],
}) {
  if (!tableSchema || !tableSchema.columns) return [];

  const columns = [];

  tableSchema.columns.forEach(col => {
    const columnName = col.name;       // ← تعديل 1
    const dataType = col.db_type;      // ← تعديل 2
    const comment = col.comment;

    // إذا لم يكن العمود ضمن FieldsShow → تجاهله
    if (FieldsShow.length && !FieldsShow.includes(columnName)) {
      return;
    }

    const mapped = mapDbTypeToUi(dataType, columnName);

    const column = createColumn({
      field: columnName,
      headerName: comment || columnName,
      uiType: mapped.type,
      filterType: mapped.filter,
      roles,
      currentUserRoles,
    });

    if (column) columns.push(column);
  });

  // إضافة عمود الـ Actions
  if (actions.length) {
    columns.push({
      field: "__actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      type: "actions",
      actions,
    });
  }

  return columns;
}
