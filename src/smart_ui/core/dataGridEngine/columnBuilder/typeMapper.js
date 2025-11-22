export function mapDbTypeToUi(dbType, columnName = '', demoMode = false) {
  if (!dbType) {
    return {
      type: 'string',
      filter: demoMode ? null : 'text',
    };
  }

  const t = dbType.toLowerCase();
  const cn = columnName.toLowerCase();

  // ===================================================================
  // 🔵 DEMO MODE — تعطيل الفلاتر بالكامل
  // ===================================================================
  const noFilter = demoMode ? null : undefined;

  // رقم
  if (t.includes('int') || t.includes('numeric') || t.includes('decimal')) {
    return { type: 'number', filter: demoMode ? null : 'numberRange' };
  }

  // تاريخ / وقت
  if (t.includes('date') || t.includes('time')) {
    return { type: 'date', filter: demoMode ? null : 'dateRange' };
  }

  // Boolean
  if (t.includes('bool')) {
    return { type: 'boolean', filter: demoMode ? null : 'boolean' };
  }

  // صور / ملفات
  if (cn.includes('photo') || cn.includes('image') || cn.includes('file')) {
    return { type: 'image', filter: null };
  }

  // نصوص + UUID
  if (t.includes('char') || t.includes('text') || t.includes('uuid')) {
    return { type: 'string', filter: demoMode ? null : 'text' };
  }

  // JSON
  if (t.includes('json')) {
    return { type: 'json', filter: null };
  }

  // الافتراضي
  return { type: 'string', filter: demoMode ? null : 'text' };
}
