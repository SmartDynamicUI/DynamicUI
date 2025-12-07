import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Typography, TextField, MenuItem, Button, Stack } from '@mui/material';
import { buildFormFields } from './SchemaFormBuilder';
import { SmartActions } from '../../core/permissions/smartActions';

export default function BasicTabRenderer({
  row,
  schema,
  tableName,
  hideFields = [],
  mode: controlledMode,
  onSave,
  onCancel,
  userRoles = [],
  permissions = {},
}) {
  ////////////////////////////////////////////////////////////////////////////
  // 1) Hooks + state
  ////////////////////////////////////////////////////////////////////////////
  const [localMode, setLocalMode] = useState('view');
  const [formData, setFormData] = useState(row || {});

  // تأمين userRoles كمصفوفة دائمًا
  const rolesArray = useMemo(() => (Array.isArray(userRoles) ? userRoles : userRoles ? [userRoles] : []), [userRoles]);

  // تعديل البيانات عند تغيير الصف
  useEffect(() => {
    setFormData(row || {});
  }, [row]);

  ////////////////////////////////////////////////////////////////////////////
  // 2) صلاحيات عامة على مستوى التاب
  ////////////////////////////////////////////////////////////////////////////
  const canView = SmartActions.can('view', {}, permissions || {}, rolesArray);
  const canEdit = SmartActions.can('edit', {}, permissions || {}, rolesArray);

  // تحديد وضع الـ Form
  const mode = canEdit ? controlledMode || localMode : 'view';
  const isView = mode === 'view';

  ////////////////////////////////////////////////////////////////////////////
  // 3) إخفاء الحقول (عام + حسب الدور + حسب قواعد الحقول)
  ////////////////////////////////////////////////////////////////////////////
  const dynamicHidden = useMemo(() => {
    const context = { formData, row, mode };
    const hiddenByPerms = SmartActions.getHiddenFields(permissions || {}, rolesArray, context);

    const all = [...hideFields, ...hiddenByPerms];
    return Array.from(new Set(all));
  }, [permissions, rolesArray, hideFields, formData, row, mode]);

  // إخفاء فقط في وضع العرض (القراءة)
  const hideInViewSet = useMemo(() => {
    const set = new Set();
    const fieldsCfg = permissions.fields || {};

    Object.entries(fieldsCfg).forEach(([name, cfg]) => {
      const behavior = SmartActions.getFieldBehavior(permissions, name, rolesArray, { formData, row, mode });
      if (behavior.hideInView) {
        set.add(name);
      }
    });

    return set;
  }, [permissions, rolesArray, formData, row, mode]);

  ////

  ////////////////////////////////////////////////////////////////////////////
  // 4) بناء الحقول من السكيما
  ////////////////////////////////////////////////////////////////////////////
  const fields = useMemo(
    () =>
      buildFormFields(schema, tableName, {
        ignore: dynamicHidden,
      }),
    [schema, tableName, dynamicHidden]
  );

  ////////////////////////////////////////////////////////////////////////////
  // 5) وظائف تعديل البيانات
  ////////////////////////////////////////////////////////////////////////////
  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (onSave) onSave(formData);
    if (!controlledMode) setLocalMode('view');
  };

  const handleCancel = () => {
    setFormData(row || {});
    if (onCancel) onCancel();
    if (!controlledMode) setLocalMode('view');
  };

  ////////////////////////////////////////////////////////////////////////////
  // 6) سلوك الحقل (required / readOnly) بناءً على SmartActions.getFieldBehavior
  ////////////////////////////////////////////////////////////////////////////
  const getFieldBehavior = (fieldName) => {
    return SmartActions.getFieldBehavior(permissions, fieldName, rolesArray, {
      formData,
      row,
      mode,
    });
  };

  ////////////////////////////////////////////////////////////////////////////
  // 7) render edit field
  ////////////////////////////////////////////////////////////////////////////
  const renderEditField = (field, value) => {
    const { name, label, inputType, required } = field;
    const behavior = getFieldBehavior(name);
    const effRequired = typeof behavior.requiredOverride === 'boolean' ? behavior.requiredOverride : required;
    const readOnly = behavior.readOnly;

    // boolean select
    if (inputType === 'boolean') {
      return (
        <TextField
          fullWidth
          select
          label={label}
          value={value ?? ''}
          required={effRequired}
          onChange={(e) => handleFieldChange(name, e.target.value)}
          disabled={readOnly}
        >
          <MenuItem value="">—</MenuItem>
          <MenuItem value="true">نعم</MenuItem>
          <MenuItem value="false">لا</MenuItem>
        </TextField>
      );
    }

    if (inputType === 'file') {
      return (
        <Box>
          <Typography sx={{ fontSize: 13, mb: 0.5 }}>{label}</Typography>
          <input
            type="file"
            disabled={readOnly}
            onChange={(e) => handleFieldChange(name, e.target.files?.[0] || null)}
          />
        </Box>
      );
    }

    // باقي الأنواع: text / number / date
    return (
      <TextField
        fullWidth
        label={label}
        type={inputType}
        required={effRequired}
        value={value ?? ''}
        onChange={(e) => handleFieldChange(name, e.target.value)}
        disabled={readOnly}
      />
    );
  };

  ////////////////////////////////////////////////////////////////////////////
  // 8) الآن يمكننا وضع return الشرطي safely
  ////////////////////////////////////////////////////////////////////////////
  if (!canView) return null;

  ////////////////////////////////////////////////////////////////////////////
  // 9) واجهة UI
  ////////////////////////////////////////////////////////////////////////////
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {fields
          .filter((f) => !f.hidden)
          .map((field) => {
            const value = formData[field.name];
            const behavior = getFieldBehavior(field.name);

            // إخفاء الحقل فقط في وضع العرض
            if (isView && behavior.hideInView) {
              return null;
            }

            return (
              <Grid item xs={12} md={6} key={field.name}>
                {isView ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      {field.label}
                    </Typography>
                    <Typography variant="body1">
                      {value !== undefined && value !== null && value !== '' ? String(value) : '—'}
                    </Typography>
                  </Box>
                ) : (
                  renderEditField(field, value)
                )}
              </Grid>
            );
          })}
      </Grid>
{isView && canEdit && (
  <Button
    variant="contained"
    color="primary"
    onClick={() => setLocalMode('edit')}
    sx={{ mt: 3 }}
  >
    تعديل
  </Button>
)}

      {!isView && canEdit && (
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-start' }}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            حفظ
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleCancel}>
            إلغاء
          </Button>
        </Stack>
      )}
    </Box>
  );
}
