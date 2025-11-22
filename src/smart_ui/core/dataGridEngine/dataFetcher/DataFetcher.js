import { httpGet } from '../../schemaEngine/httpClient/HttpClient.js';

export async function fetchPagedData(table, page, pageSize, demoMode = false) {
  // ==================================================================
  // 🔵 DEMO MODE — لا API على الإطلاق
  // ==================================================================
  if (demoMode) {
    return {
      rows: [],
      total: 0,
    };
  }

  // ==================================================================
  // 🔵 الوضع الطبيعي مع API
  // ==================================================================
  const url = `http://127.0.0.1:9001/api/mains/smart-grid/${table}?page=${page}&pageSize=${pageSize}`;

  const res = await httpGet(url);

  if (res && res.success && res.data) {
    return {
      rows: res.data.records || [],
      total: res.data.total ?? (res.data.records ? res.data.records.length : 0),
    };
  }

  return { rows: [], total: 0 };
}
