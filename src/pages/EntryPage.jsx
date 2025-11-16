import * as React from 'react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Drawer, IconButton, Divider, Grid, Avatar, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid'; // إضافة GridToolbar
import { useApi } from '../utils';
import { DangerMsg } from '../components/NotificationMsg';
import { Stack, Typography } from '@mui/material';
import { format } from 'date-fns'; // مكتبة احترافية للتعامل مع التواريخ
import { ar } from 'date-fns/locale'; // استيراد اللغة العربية
import { auth } from 'src/firebase.config';
import {
  initSchemaEngine,
  getSchema,
  getColumns,
  getObjectTemplate,
  getFields,
} from '../smart_ui/core/schemaEngine/index.js';

import { SmartDataGrid } from "../smart_ui/core/SmartDataGrid";
import { memoryCache } from "../smart_ui/core/schemaEngine/schemaCache/SchemaCache"; // أو من الـ store عندك


const API_BASE_URL = process.env.REACT_APP_SCHEMA_ENDPOINT;

export default function RefugeesGrid() {
  const api = useApi();

//     const schema = memoryCache.schemas; // أو من context

// console.log('schema columins',schema['refugees']);


  const [schema, setSchema] = useState(null);
  const [columns, setColumns] = useState([]);
  const [template, setTemplate] = useState({});
  const [fields, setFields] = useState([]);

  // useEffect(() => {
  //   async function load() {
  //     // 1) تشغيل المحرك لأول مرة
  //     await initSchemaEngine({
  //       endpointOverride: API_BASE_URL,
  //     });
  //     const table='refugees'
  //     // 2) اختيار أي جدول تريده (هنا refugees)
  //     const s = getSchema(table);
  //     const cols = getColumns(table);
  //     const temp = getObjectTemplate(table);
  //     const f = getFields(table);

  //     setSchema(s);
  //     setColumns(cols);
  //     setTemplate(temp);
  //     setFields(f);
  //   }

  //   load();
  // }, []);


  useEffect(() => {
    async function load() {
      await initSchemaEngine({ endpointOverride: API_BASE_URL });
      setSchema(memoryCache.schemas);
    }
    load();
  }, []);

  if (!schema) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Schema Example Me</h2>

      <SmartDataGrid
        table="refugees"
        schema={schema["refugees"]}            // ← سكيما جدول واحد
        FieldsShow={["id", "frist_name", "origin_country",'birth_place','gender','current_stage']} // الأعمدة التي تريد إظهارها فقط
        // actions={["edit", "delete"]}           // مستقبلاً نربطها بأزرار
        initialPageSize={2}
  pageSizeOptions={[2, 5, 10, 20]}   // ← أضف هذه
      />
    </div>
  );
}
