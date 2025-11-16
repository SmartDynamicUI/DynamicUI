
export function createColumn({
  field,
  headerName,
  uiType,
  filterType,
  width = 180,
  sortable = true,
  roles,
  currentUserRoles,
}) {
  if (roles && roles.length && currentUserRoles.length) {
    const allowed = roles.some(r => currentUserRoles.includes(r));
    if (!allowed) return null;
  }

  return {
    field,
    headerName,
    type: uiType,
    filter: filterType,
    width,
    sortable,
    flex: 1,
  };
}
