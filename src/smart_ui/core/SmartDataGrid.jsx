import { useEffect, useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { buildColumns } from '../core/dataGridEngine/columnBuilder/columnBuilder.js';
import { fetchPagedData } from '../core/dataGridEngine/dataFetcher/DataFetcher.js';
import RowDrawer from '../components/RowDrawer.jsx';

export function SmartDataGrid({
  table,
  schema,
  FieldsShow = [],
  roles = [],
  actions = [],
  initialPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  getRowId,

  // خصائص الــ Drawer الجديدة
  DrawerTabs = [],
  DrawerHideFields = [],
  DrawerTitle,
  drawerWidth,
  DrawerStyle = {},
  DrawerActions = [],
  DrawerFooter,
  DrawerTabsVisible,
  customTabRenderer = {},
  lazyTabs = true,
  initialTab = null,
  onTabChange,
  onBeforeOpen, // شرط قبل فتح الدروار
}) {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [loading, setLoading] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // توليد الأعمدة
  const columns = useMemo(() => {
    if (!schema) return [];
    return buildColumns({
      tableSchema: schema,
      FieldsShow,
      roles,
      currentUserRoles: roles,
      actions,
    });
  }, [schema, FieldsShow, roles, actions]);

  // جلب البيانات من API
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const { rows, total } = await fetchPagedData(table, page + 1, pageSize);

      if (!cancelled) {
        setRows(rows);
        setRowCount(total);
        setLoading(false);
      }
    }

    if (table) load();

    return () => {
      cancelled = true;
    };
  }, [table, page, pageSize]);

  const resolveRowId = (row) => {
    return getRowId ? getRowId(row) : row.id;
  };

  // دالة فتح الـ Drawer مع شرط onBeforeOpen
  const handleOpenDrawer = async (row) => {
    if (onBeforeOpen) {
      const allow = await onBeforeOpen(row);
      if (!allow) return;
    }
    setSelectedRow(row);
    setDrawerOpen(true);
  };

  if (!schema) return <div>Loading schema...</div>;

  return (
    <>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        loading={loading}
        onRowClick={(params) => handleOpenDrawer(params.row)}
        pagination
        paginationMode="server"
        page={page}
        pageSize={pageSize}
        rowCount={rowCount}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setPage(0);
          setPageSize(newSize);
        }}
        rowsPerPageOptions={pageSizeOptions}
        disableSelectionOnClick
        getRowId={resolveRowId}
      />

      {/* 🔥 RowDrawer الجديد — تمرير جميع الخصائص */}
      <RowDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        row={selectedRow}
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
      />
    </>
  );
}
