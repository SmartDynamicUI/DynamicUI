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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const FILES_BASE_URL = process.env.REACT_APP_FILES_BASE_URL;
const DEFAULT_PHOTO = process.env.REACT_APP_DEFAULT_PHOTO;

export default function RefugeesGrid() {
  const api = useApi();

  const [schema, setSchema] = useState(null);
  const [columns, setColumns] = useState([]);
  const [template, setTemplate] = useState({});
  const [fields, setFields] = useState([]);

  useEffect(() => {
    async function load() {
      // 1) تشغيل المحرك لأول مرة
      await initSchemaEngine({
        endpointOverride: API_BASE_URL,
      });

      // 2) اختيار أي جدول تريده (هنا refugees)
      const s = getSchema('refugees');
      const cols = getColumns('refugees');
      const temp = getObjectTemplate('refugees');
      const f = getFields('refugees');

      setSchema(s);
      setColumns(cols);
      setTemplate(temp);
      setFields(f);
    }

    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Schema Example Me</h2>

      {!schema && <p>Loading schema...</p>}

      {schema && (
        <>
          <h3>Table: {schema.tableName}</h3>

          <h4>Columns:</h4>
          <pre>{JSON.stringify(columns, null, 2)}</pre>

          <h4>Object Template:</h4>
          <pre>{JSON.stringify(template, null, 2)}</pre>

          <h4>Fields:</h4>
          <pre>{JSON.stringify(fields, null, 2)}</pre>
        </>
      )}
    </div>
  );
}
