
// import { httpGet } from "../../schemaEngine/httpClient/HttpClient.js";

// export async function fetchPagedData(table, page, pageSize) {
//   const url = `/api/smart-grid/${table}?page=${page}&pageSize=${pageSize}`;

//   return await httpGet(url);
// }

// DataFetcher.js
// مسؤولة عن جلب البيانات من الـ API باستخدام HttpClient الموجود عندك في schemaEngine

import { httpGet } from "../../schemaEngine/httpClient/HttpClient.js";

/**
 * يجلب صفحة من البيانات لجدول معيّن من الـ API.
 *
 * @param {string} table     اسم الجدول في الـ API (مثلاً "refugees")
 * @param {number} page      رقم الصفحة (1-based في الـ API)
 * @param {number} pageSize  عدد السجلات في كل صفحة
 *
 * @returns Promise<{ rows: any[], total: number }>
 */
export async function fetchPagedData(table, page, pageSize) {
  // مسار الـ API — عدّله لو مسارك مختلف
  const url = `http://127.0.0.1:9001/api/mains/smart-grid/${table}?page=${page}&pageSize=${pageSize}`;

  const res = await httpGet(url);
console.log("API response:", res);

  // هنا نفترض أن الـ API يرجع: { success, data: { records, total } }
  if (res && res.success && res.data) {
    return {
      rows: res.data.records || [],
      total: res.data.total ?? (res.data.records ? res.data.records.length : 0),
    };
  }

  // في حال فشل الاستجابة أو شكل مختلف
  return { rows: [], total: 0 };
}
