// import Drawer from '@mui/material/Drawer';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
// import Divider from '@mui/material/Divider';

// export default function RowDrawer({ open, onClose, row, schema }) {
//   if (!row || !schema) return null;

//   return (
//     <Drawer anchor="right" open={open} onClose={onClose}>
//       <Box sx={{ width: '100%', padding: 2 }}>
//         <Typography variant="h6" sx={{ mb: 2 }}>
//           التفاصيل{' '}
//         </Typography>

//         {schema.columns.map((col) => (
//           <Box key={col.name} sx={{ mb: 2 }}>
//             <Typography sx={{ fontWeight: 'bold' }}>{col.comment || col.name}</Typography>
//             <Typography color="text.secondary">{String(row[col.name] ?? '')}</Typography>
//             <Divider sx={{ mt: 1 }} />
//           </Box>
//         ))}
//       </Box>
//     </Drawer>
//   );
// }

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  Grid,
  List,
  ListItem,
  useTheme,
  Stack, // استخدام Stack لتنظيم العنوان والفاصل
} from '@mui/material';

// يجب استيراد جميع المكونات التي تحتاجها في رأس الملف

export default function RowDrawer({ open, onClose, row, schema }) {
  // استخدام useTheme لضمان التنسيق الموحد والمعياري
  const theme = useTheme();

  // Guard Clause: التأكد من وجود البيانات قبل العرض
  if (!row || !schema || !schema.columns) {
    return null;
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        role="presentation" // لتحسين إمكانية الوصول (Accessibility)
        sx={{
          // 2. استغلال المساحة وتنسيق عالمي: عرض مختلف حسب حجم الشاشة
          width: { xs: '100vw', sm: 350, md: 450 },
          maxWidth: '100%',
          padding: theme.spacing(3), // استخدام المسافات المعيارية
        }}
      >
        {/* العنوان والفاصل في Stack لسهولة التنظيم */}
        <Stack spacing={2} sx={{ mb: theme.spacing(2) }}>
          <Typography
            variant="h5"
            component="h2" // استخدام component="h2" للمعايير الدلالية
            sx={{ fontWeight: 600 }}
          >
            تفاصيل
          </Typography>
          <Divider />
        </Stack>

        {/* 1. سهولة القراءة: استخدام List لعرض تفاصيل البيانات بشكل منظم */}
        <List dense disablePadding>
          {schema.columns.map((col) => {
            const label = col.comment || col.name;
            const rawValue = row[col.name];
            const value = String(rawValue ?? '-'); // عرض "-" إذا كانت القيمة فارغة أو غير موجودة

            // // تطبيق المعيار: تجاهل الحقول التي لا تحتوي على تسمية أو قيمة مهمة
            // if (!label || rawValue === null || rawValue === undefined || rawValue === '') {
            //   // يمكنك إزالة هذا الشرط إذا أردت عرض جميع الحقول حتى الفارغة منها
            //   return null;
            // }

            return (
              // ListItem يُستخدم لتمثيل صف في القائمة
              <ListItem
                key={col.name}
                disablePadding
                sx={{
                  py: theme.spacing(1.5), // مسافة عمودية موحدة
                  borderBottom: `1px solid ${theme.palette.divider}`, // فاصل بين العناصر
                }}
              >
                {/* 2. استغلال المساحة: استخدام Grid لعرض التسمية والقيمة جنباً إلى جنب */}
                <Grid container spacing={1} alignItems="flex-start">
                  {/* التسمية: 40% من العرض على الشاشات الكبيرة */}
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'bold' }}>
                      {label}
                    </Typography>
                  </Grid>

                  {/* القيمة: 60% من العرض على الشاشات الكبيرة */}
                  <Grid item xs={12} sm={8}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        wordBreak: 'break-word', // مهم للتعامل مع النصوص الطويلة
                        textAlign: { xs: 'right', sm: 'left' }, // تنسيق القيمة
                      }}
                    >
                      {value}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}
