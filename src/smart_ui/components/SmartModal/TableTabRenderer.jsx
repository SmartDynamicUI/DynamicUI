// TableTabRenderer.jsx
import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

import InlineFormRenderer from './InlineFormRenderer';
import { buildFormFields } from './SchemaFormBuilder';
import { SmartActions } from '../../core/permissions/smartActions';

/**
 * TableTabRenderer
 * - يعرض جدول أي تاب من نوع table
 * - يدعم إضافة / تعديل / حذف (UI فقط - بدون API)
 * - يستخدم InlineFormRenderer + SchemaFormBuilder
 */

export function TableTabRenderer({
  rows = [],
  tab = {},
  schema = {},
  row: parentRow = {},
  roles = [],
  permissions = {},        // 👈 استقبال الصلاحيات النهائية
}) {
  const tableName = tab.table;
  const nameColumn = tab.nameColumn; // FK مثل refugee_id

  // form state
  const [activeEditRowId, setActiveEditRowId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({});

  // استخراج تعريف الحقول من السكيما
  const tableSchema = schema[tableName] || {};
  const fields = buildFormFields(tableSchema, { mode: 'table' });

  // ===== تهيئة template للسجل الجديد =====
  const template = tableSchema.objectTemplate || {};

  // ===== بدء تعديل سجل موجود =====
  const handleEdit = (r) => {
    setShowAddForm(false);
    setActiveEditRowId(r.id);
    setFormData(r);
  };

  // ===== تشغيل وضع الإضافة =====
  const handleAdd = () => {
    setActiveEditRowId(null);
    setShowAddForm(true);

    const filled = { ...template };

    // ملء الـ FK مثل refugee_id
    if (nameColumn && parentRow?.id) {
      filled[nameColumn] = parentRow.id;
    }

    setFormData(filled);
  };

  // ===== إلغاء التعديل أو الإضافة =====
  const handleCancel = () => {
    setActiveEditRowId(null);
    setShowAddForm(false);
    setFormData({});
  };

  // ===== حفظ (UI فقط - المرحلة الثانية سنربط API) =====
  const handleSave = () => {
    console.log('Saving record:', formData);
    setActiveEditRowId(null);
    setShowAddForm(false);
  };

  // ===== حذف (UI فقط) =====
  const handleDelete = (r) => {
    console.log('Deleting record:', r);
  };

  // أدوار المستخدم
  const userRoles = Array.isArray(roles) ? roles : roles ? [roles] : [];

  // 👈 صلاحيات الجدول من permissions.tables[tableName]
  const tablePerms = permissions?.tables?.[tableName] || {};

  const canAdd = SmartActions.can('add', {}, tablePerms, userRoles);
  const canEdit = SmartActions.can('edit', {}, tablePerms, userRoles);
  const canDelete = SmartActions.can('delete', {}, tablePerms, userRoles);

  // ===== العناوين =====
  const headers = fields.map((f) => f.label || f.name);

  if (canEdit || canDelete) {
    headers.push('خيارات');
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* زر الإضافة */}
      {canAdd && (
        <Box sx={{ mb: 1 }}>
          <Button variant="contained" size="small" onClick={handleAdd}>
            إضافة سجل جديد
          </Button>
        </Box>
      )}

      {/* الجدول */}
      {rows?.length === 0 ? (
        <Typography sx={{ padding: 2 }}>لا توجد بيانات.</Typography>
      ) : (
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    borderBottom: '1px solid #ddd',
                    textAlign: 'left',
                    padding: '8px',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <React.Fragment key={r.id}>
                {/* الصف */}
                <tr>
                  {fields
                    .filter((f) => !f.hidden)
                    .map((f, i) => (
                      <td
                        key={i}
                        style={{
                          padding: '8px',
                          borderBottom: '1px solid #eee',
                        }}
                      >
                        {String(r[f.name] ?? '—')}
                      </td>
                    ))}

                  {(canEdit || canDelete) && (
                    <td
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid #eee',
                      }}
                    >
                      {canEdit && (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => handleEdit(r)}
                        >
                          تعديل
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="small"
                          color="error"
                          variant="text"
                          onClick={() => handleDelete(r)}
                        >
                          حذف
                        </Button>
                      )}
                    </td>
                  )}
                </tr>

                {/* صفّ التحرير / الإضافة */}
                {activeEditRowId === r.id && (
                  <tr>
                    <td colSpan={headers.length}>
                      <InlineFormRenderer
                        fields={fields}
                        value={formData}
                        onChange={setFormData}
                        onSave={handleSave}
                        onCancel={handleCancel}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {/* صف الإضافة المنفصل */}
          </tbody>
        </Box>
      )}
    </Box>
  );
}
