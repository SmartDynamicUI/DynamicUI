const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  'http://127.0.0.1:9001/api';

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
    tab.DeleteEndPoint || `${API_BASE}/mains/${tableName}/id/${rowId}`; // DELETE

    console.log('deleteee', deleteUrl);
    
  return {
    addUrl,
    editUrl,
    deleteUrl,
  };
}
