
// EndpointAdapter.js

/**
 * EndpointAdapter
 *
 * - يبني روابط الـ API لعمليات (add/edit/delete)
 * - يعتمد على إعدادات التاب (TabConfig) + اسم الجدول + السجل الحالي
 *
 * التاب يمكن أن يرسل:
 *   EditEndPoint:   "http://localhost:9001/api/mains/family_members/id/55"
 *   DeleteEndPoint: "..."
 *   AddEndPoint:    "..."
 *
 * أو يمكن أن يكون فارغاً → ونستخدم fallback آلي:
 *   POST   /api/mains/{table}                    → للإضافة
 *   PUT    /api/mains/{table}/id/{row.id}        → للتعديل
 *   DELETE /api/mains/{table}/id/{row.id}        → للحذف
 */

const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  'http://127.0.0.1:9001/api/mains';

/**
 * EndpointBuilder
 * @param {*} tab - إعدادات التاب
 * @param {*} tableName - اسم الجدول (مثال: "family_members")
 * @param {*} row - السجل الحالي
 */
export function getEndpoints(tab = {}, tableName, row = {}) {
  const rowId = row?.id;

  // ------------- ADD -------------
  const addUrl = tab.AddEndPoint || `${API_BASE}/${tableName}`; // POST

  // ------------- EDIT -------------
  const editUrl =
    tab.EditEndPoint || `${API_BASE}/${tableName}/id/${rowId}`; // PUT

  // ------------- DELETE -------------
  const deleteUrl =
    tab.DeleteEndPoint || `${API_BASE}/${tableName}/id/${rowId}`; // DELETE

  return {
    addUrl,
    editUrl,
    deleteUrl,
  };
}
