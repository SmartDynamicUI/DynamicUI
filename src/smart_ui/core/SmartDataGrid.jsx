import { useEffect, useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { buildColumns } from "../core/dataGridEngine/columnBuilder/columnBuilder.js";
import { fetchPagedData } from "../core/dataGridEngine/dataFetcher/DataFetcher.js";

export function SmartDataGrid({
  table,
  schema,
  FieldsShow = [],
  roles = [],
  actions = [],
  initialPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  getRowId,
}) {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);  // MUI uses 0-based pages
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [loading, setLoading] = useState(false);

  // columns
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

  // fetch data
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const { rows, total } = await fetchPagedData(
        table,
        page + 1,      // API uses 1-based
        pageSize
      );

      if (!cancelled) {
        setRows(rows);
        setRowCount(total);
        setLoading(false);
      }
    }

    if (table) load();

    return () => { cancelled = true; };
  }, [table, page, pageSize]);

  const resolveRowId = (row) => {
    if (getRowId) return getRowId(row);
    return row.id;
  };

  if (!schema) return <div>Loading schema...</div>;

  return (
    <DataGrid
      autoHeight
      rows={rows}
      columns={columns}
      loading={loading}
      
      // 🔥 REQUIRED
      pagination
      paginationMode="server"
      page={page}
      pageSize={pageSize}
      rowCount={rowCount}

      onPageChange={(newPage) => {
        setPage(newPage);
      }}

      onPageSizeChange={(newSize) => {
        setPage(0);
        setPageSize(newSize);
      }}

      rowsPerPageOptions={pageSizeOptions}
      disableSelectionOnClick
      getRowId={resolveRowId}
    />
  );
}
