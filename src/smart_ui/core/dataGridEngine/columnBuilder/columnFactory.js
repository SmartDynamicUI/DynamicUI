export function createColumn({
  field,
  headerName,
  uiType,
  filterType,
  width = 180,
  sortable = true,
  roles,
  currentUserRoles,
  demoMode = false, // 🔵 تمت إضافة هذا السطر
}) {
  // ================================================================
  // 🔵 1) DEMO MODE — تجاهل الصلاحيات بشكل كامل (للعرض فقط)
  // ================================================================
  if (!demoMode) {
    if (roles && roles.length && currentUserRoles.length) {
      const allowed = roles.some((r) => currentUserRoles.includes(r));
      if (!allowed) return null;
    }
  }

  // ================================================================
  // 🔵 2) بناء العمود كما هو بدون أي تغيير
  // ================================================================
  return {
    field,
    headerName,
    type: uiType,
    filter: demoMode ? null : filterType, // تعطيل الفلاتر في Demo Mode
    width,
    sortable: demoMode ? false : sortable, // لا داعي للفرز أثناء العرض فقط
    flex: 1,
  };
}
