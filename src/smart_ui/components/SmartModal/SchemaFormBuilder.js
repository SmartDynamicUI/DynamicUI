
/**
 * SchemaFormBuilder
 *
 * يقوم بتحويل السكيما → تعريف حقول جاهزة لبناء Inline Form أو Basic Form.
 * لا يبني فورم — فقط يرجّع meta data للحقول.
 */

export function buildFormFields(schema, tableName, options = {}) {
  if (!schema || !schema[tableName] || !schema[tableName].columns) {
    console.warn('SchemaFormBuilder: schema/tableName not valid:', tableName);
    return [];
  }

  const { nameColumn, ignore = [] } = options;
  const columns = schema[tableName].columns;

  return columns
    .map((col) => {
      const name = col.name;
      const uiType = col.ui_type || 'text';
      const isRequired = col.required || false;

      // ===== إخفاء الحقول التي لا تحتاج للعرض =====
      if (
        name === 'id' ||
        name === nameColumn || // المفتاح الأجنبي (مثل refugee_id)
        name === 'created_at' ||
        name === 'updated_at' ||
        ignore.includes(name)
      ) {
        return { name, hidden: true };
      }

      // ===== label =====
      const label = col.comment || convertNameToLabel(name);

      // ===== تحديد input type =====
      let inputType = 'text';
      if (uiType === 'number') inputType = 'number';
      if (uiType === 'date') inputType = 'date';
      if (uiType === 'boolean') inputType = 'boolean'; // سنعالجه لاحقاً كقائمة
      if (uiType === 'image') inputType = 'file';

      return {
        name,
        label,
        uiType,
        inputType,
        required: isRequired,
        hidden: false,
      };
    })
    .filter((f) => f !== null);
}

/* --------------------------------------------------
   تحويل اسم العمود إلى نص قابل للقراءة
   مثل: first_name_member → First Name Member
---------------------------------------------------- */
function convertNameToLabel(name) {
  if (!name) return '';
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
