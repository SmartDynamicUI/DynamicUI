
// TableTabRenderer.jsx
import React, { useState } from 'react';
import { Box, Button, Typography, Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,Alert,Snackbar } from '@mui/material';

import InlineFormRenderer from './InlineFormRenderer';
import { buildFormFields } from './SchemaFormBuilder';
import { SmartActions } from '../../core/permissions/smartActions';
import { getEndpoints } from '../../components/SmartModal/EndpointAdapter'

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
}) {
  const tableName = tab.table;
  const nameColumn = tab.nameColumn; // FK مثل refugee_id
const [confirmOpen, setConfirmOpen] = useState(false);
const [rowToDelete, setRowToDelete] = useState(null);
const [snack, setSnack] = useState({
  open: false,
  type: "success", // success | error
  message: ""
});



  // form state
  const [activeEditRowId, setActiveEditRowId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({});

  //  بناء الحقول مع دعم إخفاء الحقول على مستوى التاب
  const fields = buildFormFields(schema, tableName, {
    nameColumn,
    ignore: tab.hideFields || [],
  });

  // ===== الصلاحيات باستخدام SmartActions =====
  const userRoles = Array.isArray(roles) ? roles : roles ? [roles] : [];
  const perms = tab.permissions || {};

  const canAdd = SmartActions.can('add', {}, perms, userRoles);
  const canEdit = SmartActions.can('edit', {}, perms, userRoles);
  const canDelete = SmartActions.can('delete', {}, perms, userRoles);

  // ===== تحميل بيانات السجل عند التعديل =====
  const handleEdit = (r) => {
    setShowAddForm(false);
    setActiveEditRowId(r.id);
    setFormData(r);
  };

  // ===== تشغيل وضع الإضافة =====
  const handleAdd = () => {
    setActiveEditRowId(null);
    setShowAddForm(true);

    // تجهيز template من السكيما
    const template = schema[tableName]?.objectTemplate || {};
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
const handleSave = async () => {
  try {
    const { editUrl } = getEndpoints(tab, tableName, formData);

    const res = await fetch(editUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error("Edit failed");

    // إغلاق الفورم
    setActiveEditRowId(null);
    setShowAddForm(false);

    // تحديث البيانات
    if (typeof tab.reload === "function") {
      await tab.reload();
    }

    // رسالة نجاح
    setSnack({
      open: true,
      type: "success",
      message: "تم تعديل السجل بنجاح",
    });

  } catch (err) {
    console.error(err);
    setSnack({
      open: true,
      type: "error",
      message: "فشل تعديل السجل",
    });
  }
};

  // ===== تحديث قيمة حقل واحد =====
  const updateField = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // ===== رأس الجدول (اسم الأعمدة) =====
  const headers = fields.filter((f) => !f.hidden).map((f) => f.label);


const handleDelete = async (record) => {
  try {
    const { deleteUrl } = getEndpoints(tab, tableName, record);

    const res = await fetch(deleteUrl, { method: "DELETE" });

    if (!res.ok) throw new Error("Delete failed");

    // تحديث الجدول إن كان هناك reload
    if (typeof tab.reload === "function") {
      await tab.reload();
    }

    setSnack({
      open: true,
      type: "success",
      message: "تم حذف السجل بنجاح"
    });

  } catch (err) {
    console.error(err);

    setSnack({
      open: true,
      type: "error",
      message: "فشل حذف السجل"
    });
  }
};




  return (
    <Box>
      {/* زر الإضافة */}
      {canAdd && (
        <Box sx={{ marginBottom: 2, textAlign: 'right' }}>
          <Button variant="contained" color="primary" onClick={handleAdd}>
            + إضافة
          </Button>
        </Box>
      )}

      {/* فورم الإضافة أعلى الجدول */}
      {showAddForm && (
        <InlineFormRenderer
          mode="add"
          fields={fields}
          formData={formData}
          onChange={updateField}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* إذا الجدول فارغ */}
      {rows.length === 0 && !showAddForm && (
        <Typography sx={{ opacity: 0.6, padding: 2 }}>
          لا توجد بيانات متوفرة.
        </Typography>
      )}

      {/* الجدول */}
      {rows.length > 0 && (
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

              {(canEdit || canDelete) && (
                <th
                  style={{
                    width: 120,
                    borderBottom: '1px solid #ddd',
                    padding: '8px',
                  }}
                >
                  خيارات
                </th>
              )}
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
                        <Button size="small" onClick={() => handleEdit(r)}>
                          تعديل
                        </Button>
                      )}

                      {canDelete && (
                      <Button
  size="small"
  color="error"
  onClick={() => {
    setRowToDelete(r);
    setConfirmOpen(true);
  }}
>
  حذف
</Button>


                      )}
                    </td>
                  )}
                </tr>

                {/* فورم التعديل يظهر تحت الصف */}
                {activeEditRowId === r.id && (
                  <tr>
                    <td colSpan={headers.length + 1}>
                      <InlineFormRenderer
                        mode="edit"
                        fields={fields}
                        formData={formData}
                        onChange={updateField}
                        onSave={handleSave}
                        onCancel={handleCancel}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Box>
      )}

<Dialog
  open={confirmOpen}
  onClose={() => setConfirmOpen(false)}
>
  <DialogTitle>تأكيد الحذف</DialogTitle>

  <DialogContent>
    <Typography>
      هل أنت متأكد أنك تريد حذف هذا السجل؟
    </Typography>
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setConfirmOpen(false)}>
      إلغاء
    </Button>

    <Button
      color="error"
      variant="contained"
      onClick={() => {
        handleDelete(rowToDelete);
        setConfirmOpen(false);
      }}
    >
      حذف
    </Button>
  </DialogActions>
</Dialog>

<Snackbar
  open={snack.open}
  autoHideDuration={3000}
  onClose={() => setSnack({ ...snack, open: false })}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
>
  <Alert
    onClose={() => setSnack({ ...snack, open: false })}
    severity={snack.type}
    sx={{ width: "100%" }}
    variant="filled"
  >
    {snack.message}
  </Alert>
</Snackbar>

    </Box>
  );
}
