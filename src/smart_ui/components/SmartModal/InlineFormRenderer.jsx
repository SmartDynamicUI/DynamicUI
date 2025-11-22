
// InlineFormRenderer.jsx
import React from 'react';
import { Box, TextField, Button, MenuItem, Typography } from '@mui/material';

/**
 * InlineFormRenderer
 * - يرسم فورم الإضافة/التعديل داخل الجدول
 * - يعتمد على fields (من SchemaFormBuilder)
 * - formData = قيم النموذج
 * - onChange = تحديث حقل واحد
 * - onSave = حفظ النموذج
 * - onCancel = إلغاء العملية
 */

export default function InlineFormRenderer({
  mode = 'edit', // "add" أو "edit"
  fields = [],
  formData = {},
  onChange,
  onSave,
  onCancel,
}) {
  return (
    <Box
      sx={{
        padding: 2,
        marginY: 1,
        background: '#fafafa',
        border: '1px solid #ddd',
        borderRadius: 2,
      }}
    >
      {/* عنوان صغير */}
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 'bold',
          marginBottom: 1,
          color: '#444',
        }}
      >
        {mode === 'add' ? 'إضافة سجل جديد' : 'تعديل السجل'}
      </Typography>

      {/* الحقول */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2,
        }}
      >
        {fields.map((field) => {
          if (field.hidden) return null;

          const { name, label, inputType, required } = field;
          const value = formData[name] ?? '';

          // boolean select
          if (inputType === 'boolean') {
            return (
              <TextField
                key={name}
                select
                fullWidth
                required={required}
                label={label}
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
              >
                <MenuItem value="">—</MenuItem>
                <MenuItem value="true">نعم</MenuItem>
                <MenuItem value="false">لا</MenuItem>
              </TextField>
            );
          }

          // file input (image)
          if (inputType === 'file') {
            return (
              <Box key={name}>
                <Typography sx={{ fontSize: 13, marginBottom: 0.5 }}>
                  {label}
                </Typography>
                <input
                  type="file"
                  onChange={(e) => onChange(name, e.target.files[0])}
                />
              </Box>
            );
          }

          // بقية الأنواع: text / number / date
          return (
            <TextField
              key={name}
              fullWidth
              label={label}
              type={inputType}
              required={required}
              value={value}
              onChange={(e) => onChange(name, e.target.value)}
            />
          );
        })}
      </Box>

      {/* أزرار الحفظ والإلغاء */}
      <Box sx={{ marginTop: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={onSave}>
          حفظ
        </Button>

        <Button variant="outlined" color="secondary" onClick={onCancel}>
          إلغاء
        </Button>
      </Box>
    </Box>
  );
}
