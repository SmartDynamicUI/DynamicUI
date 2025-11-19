// SmartDataGrid.jsx
import { useEffect, useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import RowDrawer from "./RowDrawer"; // تأكد من المسار الصحيح

import { buildColumns } from "../core/dataGridEngine/columnBuilder/columnBuilder.js";
import { fetchPagedData } from "../core/dataGridEngine/dataFetcher/DataFetcher.js";

export function SmartDataGrid({
  table,
  schema,
  FieldsShow = [],
  roles = [],
  actions = [],
  initialPageSize = 3,
  pageSizeOptions = [3],
  getRowId,

  // ✅ خصائص الـ Drawer الجديدة
  DrawerTabs = [],
  DrawerHideFields = [],
  DrawerTitle,
  drawerWidth,
  DrawerStyle,
  DrawerActions = [],
  DrawerFooter,
  DrawerTabsVisible,
  customTabRenderer = {},
  lazyTabs = true,
  initialTab,
  onTabChange,
  onBeforeOpen, // شرط قبل فتح الدروار

  // (اختياري) لو حبيت تمنع فتح Drawer في جريد داخلي
  disableDrawer = false,

  // أي خصائص أخرى مستقبلًا
  ...rest
}) {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [loading, setLoading] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 👇 مثال مبسّط لجلب البيانات (عدّله حسب مشروعك)
useEffect(() => {
  let isMounted = true;
  setLoading(true);

fetchPagedData(table, page + 1, 3)   // ← فقط صفين في كل صفحة
    .then((res) => {
            console.log("SMART DATA GRID RESPONSE:", res);

      if (!isMounted) return;
      setRows(res.rows || res.data?.records || []);
setRowCount(res.total || res.data?.total || 0);

    })
    .finally(() => isMounted && setLoading(false));

  return () => (isMounted = false);
}, [table, page, pageSize]);


  const columns = useMemo(
    () =>
  buildColumns({
  tableSchema: { columns: schema[table] },   // ← الحل
  FieldsShow,
  actions,
})
,
    [table, schema, FieldsShow, actions]
  );

  // ✅ هنا نطبّق onBeforeOpen قبل فتح الدروار
  const handleRowClick = (params) => {
    if (disableDrawer) return; // للـ nested grids لو حبيت

    const row = params.row;

    if (onBeforeOpen) {
      const allow = onBeforeOpen(row);
      if (allow === false) return;
    }

    setSelectedRow(row);
    setDrawerOpen(true);
  };

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        paginationMode="server"
        pagination
        rowCount={rowCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        rowsPerPageOptions={pageSizeOptions}
        getRowId={getRowId}
        onRowClick={handleRowClick}
        {...rest}
        sx={{ height: "100%" }}
      />

      {/* ✅ Drawer ديناميكي مربوط بالـ SmartDataGrid */}
      {!disableDrawer && (
        <RowDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          row={selectedRow}
          table={table}
          schema={schema}
          DrawerTabs={DrawerTabs}
          DrawerHideFields={DrawerHideFields}
          DrawerTitle={DrawerTitle}
          drawerWidth={drawerWidth}
          DrawerStyle={DrawerStyle}
          DrawerActions={DrawerActions}
          DrawerFooter={DrawerFooter}
          DrawerTabsVisible={DrawerTabsVisible}
          customTabRenderer={customTabRenderer}
          lazyTabs={lazyTabs}
          initialTab={initialTab}
          onTabChange={onTabChange}
          roles={roles}
        />
      )}
    </>
  );
}
