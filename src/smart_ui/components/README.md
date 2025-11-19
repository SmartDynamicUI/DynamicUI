
# RowDrawer Dynamic v2

هذا المكوّن يمثّل Drawer ديناميكي لعرض تفاصيل أي سجل يتم اختياره من SmartDataGrid
مع دعم Tabs، إخفاء حقول، Actions، Footer، وتخصيص عميق عبر Props.

## الملفات في هذا الـ Pack

- `RowDrawer.jsx` : كود المكوّن الرئيسي.
- `RowDrawerProps.md` : توثيق جميع الخصائص مع أمثلة.

يُنصح أن يُستَخدم هكذا داخل `SmartDataGrid`:

```jsx
<RowDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  row={selectedRow}
  schema={schema["refugees"]}
  DrawerTabs={[
    { key: "basic", label: "المعلومات الأساسية", type: "form" },
    { key: "family", label: "العائلة", type: "custom" },
  ]}
  DrawerHideFields={["created_at", "updated_at"]}
  DrawerTitle={(row) => `تفاصيل — ID: ${row.id}`}
/>
```
