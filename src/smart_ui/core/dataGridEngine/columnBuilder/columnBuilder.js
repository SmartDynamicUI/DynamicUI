import { mapDbTypeToUi } from './typeMapper.js';
import { createColumn } from './columnFactory.js';

export function buildColumns({
  tableSchema,
  FieldsShow = [],
  roles = [],
  currentUserRoles = [],
  actions = [],
  demoMode = false, // 🔵 تمت إضافة هذا
}) {
  if (!tableSchema || !tableSchema.columns) return [];

  const columns = [];

  tableSchema.columns.forEach((col) => {
    const columnName = col.name;
    const dataType = col.db_type;
    const comment = col.comment;

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

  if (actions.length && !demoMode) {
    // 🔵 منع Actions في Demo Mode
    columns.push({
      field: '__actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      type: 'actions',
      actions,
    });
  }

  return columns;
}
