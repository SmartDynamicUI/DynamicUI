import { useEffect, useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';

import { buildColumns } from '../core/dataGridEngine/columnBuilder/columnBuilder.js';
import { fetchPagedData } from '../core/dataGridEngine/dataFetcher/DataFetcher.js';
import SmartModal from '../components/SmartModal/SmartModal.jsx';
import { SmartActions } from '../core/permissions/smartActions.js';

export function SmartDataGrid({
  table,
  schema,
  FieldsShow = [],
  userRoles = [],
  actions = [],
  initialPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  getRowId,

  demoMode = false,
  permissions = {},   // 👈 تمت إضافتها هنا

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
  onBeforeOpen,

  ...rest
}) {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [loading, setLoading] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // -------------------------------------------------------------
  // 1) LOG: السكيما التي تصل إلى SmartDataGrid
  // -------------------------------------------------------------
  console.log('📘 [SmartDataGrid] Incoming schema:', schema);
  console.log('📘 [SmartDataGrid] Schema for table:', table, schema?.[table]);

  // DEMO MODE
  useEffect(() => {
    if (demoMode) {
      console.log('🔵 DEMO MODE → SmartDataGrid uses empty rows only');
      setLoading(false);
      setRows([]);
      setRowCount(0);
      return;
    }
  }, [demoMode, table]);

  // -------------------------------------------------------------
  // 2) LOG: جلب البيانات الفعلية من API
  // -------------------------------------------------------------
  useEffect(() => {
    if (demoMode) return;

    let isMounted = true;
    setLoading(true);

    fetchPagedData(table, page + 1, pageSize)
      .then((res) => {
        console.log('📘 [SmartDataGrid] API RESULT:', res);

        if (!isMounted) return;

        if (!res || !res.rows) {
          setRows([]);
          setRowCount(0);
        } else {
          setRows(res.rows || []);
          setRowCount(res.total || 0);
        }
      })
      .catch((e) => {
        console.log('❌ [SmartDataGrid] API ERROR:', e);
        setRows([]);
        setRowCount(0);
      })
      .finally(() => isMounted && setLoading(false));

    return () => (isMounted = false);
  }, [table, page, pageSize, demoMode]);

  // -------------------------------------------------------------
  // 3) LOG: الأعمدة التي يتم بناؤها فعليًا
  // -------------------------------------------------------------
  const columns = useMemo(() => {
    console.log('📘 [SmartDataGrid] Building columns for:', table);

    // LOG: سكيما الجدول بشكل مباشر
    console.log('📘 [SmartDataGrid] Table Schema:', schema?.[table]);
    console.log('📘 [SmartDataGrid] Table Columns:', schema?.[table]?.columns);

    return buildColumns({
      tableSchema: { columns: schema[table].columns },
      FieldsShow,
      actions,
    });
  }, [table, schema, FieldsShow, actions]);

  console.log('📘 [SmartDataGrid] Final Columns:', columns);

  // -------------------------------------------------------------
  // 4) LOG: عند الضغط على صف لفتح SmartModal
  // -------------------------------------------------------------
  const handleRowClick = (params) => {
    if (demoMode) return;

    const row = params.row;
    console.log('📗 [SmartDataGrid] Selected row:', row);

    if (onBeforeOpen) {
      const allow = onBeforeOpen(row);
      if (allow === false) return;
    }

    const allowOpen = SmartActions.can(
    "open",
    permissions?.modal || {},   // صلاحيات المودل فقط
    {},                          // لا Overrides على مستوى التاب
    userRoles
  );

  if (!allowOpen) {
    console.log("⛔ لا توجد صلاحية لفتح المودل");
    return;
  }

    setSelectedRow(row);
    setModalOpen(true);
  };
  console.log('console.log(userRoles) in SmartDataGrid --->  data_entry', userRoles);

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        paginationMode="server"
        pagination={!demoMode}
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
      {/* SmartModal */}
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
        roles={userRoles}
        demoMode={demoMode}
      />
    </>
  );
}
