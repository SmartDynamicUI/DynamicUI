// SmartDataGrid.jsx
import { useEffect, useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';

import { buildColumns } from '../core/dataGridEngine/columnBuilder/columnBuilder.js';
import { fetchPagedData } from '../core/dataGridEngine/dataFetcher/DataFetcher.js';
import SmartModal from './SmartModal';

export function SmartDataGrid({
  table,
  schema,
  FieldsShow = [],
  roles = [],
  actions = [],
  initialPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  getRowId,

  // ✅ نفس خصائص الدروار لكن تُستخدم الآن للـ Modal
  DrawerTabs = [],
  DrawerHideFields = [],
  DrawerTitle,
  drawerWidth, // لن يُستخدم الآن لكن نتركه للتوافق
  DrawerStyle, // لن يُستخدم الآن لكن نتركه للتوافق
  DrawerActions = [],
  DrawerFooter,
  DrawerTabsVisible,
  customTabRenderer = {},
  lazyTabs = true,
  initialTab,
  onTabChange, // حالياً لا نستخدمه، ممكن تفعيله لاحقاً
  onBeforeOpen, // شرط قبل فتح الـ Modal

  // أي خصائص أخرى مستقبلًا
  ...rest
}) {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [loading, setLoading] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 🔹 جلب البيانات من smart-grid
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPagedData(table, page + 1, pageSize)
      .then((res) => {
        console.log('SMART DATA GRID RESPONSE:', res);

        if (!isMounted) return;
        setRows(res.rows || res.data?.records || []);
        setRowCount(res.total || res.data?.total || 0);
      })
      .finally(() => isMounted && setLoading(false));

    return () => (isMounted = false);
  }, [table, page, pageSize]);

  // 🔹 بناء الأعمدة من السكيما
  const columns = useMemo(
    () =>
      buildColumns({
        tableSchema: { columns: schema[table] },
        FieldsShow,
        actions,
      }),
    [table, schema, FieldsShow, actions]
  );

  // 🔹 التحكم بفتح المودال عند الضغط على صف
  const handleRowClick = (params) => {
    const row = params.row;

    if (onBeforeOpen) {
      const allow = onBeforeOpen(row);
      if (allow === false) return;
    }

    setSelectedRow(row);
    setModalOpen(true);
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
        sx={{ height: '100%' }}
        {...rest}
      />

      {/* ✅ SmartModal بدل RowDrawer */}
      <SmartModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        table={table}
        row={selectedRow}
        schema={schema}
        DrawerTabs={DrawerTabs}
        DrawerHideFields={DrawerHideFields}
        DrawerTitle={DrawerTitle}
        DrawerActions={DrawerActions}
        DrawerFooter={DrawerFooter}
        DrawerTabsVisible={DrawerTabsVisible}
        customTabRenderer={customTabRenderer}
        lazyTabs={lazyTabs}
        initialTab={initialTab}
        roles={roles}
      />
    </>
  );
}
