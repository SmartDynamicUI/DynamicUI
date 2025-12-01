import * as React from 'react';
import { useEffect, useState, useCallback, useMemo, useContext } from 'react';
import { Drawer, Button, IconButton, Divider, Grid, Avatar, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid'; // إضافة GridToolbar
import { useApi } from '../utils';
import { DangerMsg } from '../components/NotificationMsg';
import { Stack, Typography } from '@mui/material';
import { format } from 'date-fns'; // مكتبة احترافية للتعامل مع التواريخ
import { ar, vi } from 'date-fns/locale'; // استيراد اللغة العربية
import { auth } from 'src/firebase.config';
import {
  initSchemaEngine,
  getSchema,
  getColumns,
  getObjectTemplate,
  getFields,
} from '../smart_ui/core/schemaEngine/index.js';
import { appContext } from '../context/appContext';

import { SmartDataGrid } from '../smart_ui/components/SmartDataGrid';
import { memoryCache } from '../smart_ui/core/schemaEngine/schemaCache/SchemaCache'; // أو من الـ store عندك
import { add } from 'lodash';

const API_BASE_URL = process.env.REACT_APP_SCHEMA_ENDPOINT;

export default function RefugeesGrid() {
  const api = useApi();
  const { user } = useContext(appContext);
  const userRoles = user?.roles || [];
  console.log('User Roles:', userRoles);

  const [schema, setSchema] = useState(null);
  const [columns, setColumns] = useState([]);
  const [template, setTemplate] = useState({});
  const [fields, setFields] = useState([]);
const permissions = {
  modal: {
    open: ["admin", "data_entry", "reviewer"] // ← أدوار مسموحة
  }
};



  useEffect(() => {
    async function load() {
      await initSchemaEngine({ endpointOverride: API_BASE_URL });
      setSchema(memoryCache.schemas);
    }
    load();
  }, []);

  // تحويل السكيما إلى الشكل المطلوب
  const uiSchema = useMemo(() => {
    if (!schema) return null;

    const out = {};
    for (let table in schema) {
      out[table] = schema[table].columns;
    }
    return out;
  }, [schema]);

  console.log('schema', schema);
  if (!schema) return <div>Loading...</div>;
  console.log('           permissions={permissions} ---> ',           {permissions}  
);

  
  return (
    <div style={{ padding: 20 }}>
      <h2>Schema Example Me</h2>

      <Box sx={{ height: 'calc(100vh - 200px)' }}>
        <SmartDataGrid
          table="refugees"
          schema={schema}
          FieldsShow={['id', 'frist_name', 'gender', 'gov_label']}
          // userRoles={userRoles}
          DrawerTabs={[
            {
              key: 'basic',
              label: 'الأساسي',
              type: 'form',
              table: 'refugees', // ← جدول الأساسي
            },
            {
              key: 'family',
              label: 'أفراد العائلة',
              type: 'table',
              table: 'family_members',
              nameColumn: 'refugee_id', // 🔥 الربط
              // hideFields: ['first_name_member'],
              permissions: {
                view: true,
                edit: true,
                delete: ['data_entry'],
                // delete: true,
                // delete: false,
                // add: ['data_entry'],
              },
            },
            {
              key: 'stages',
              label: 'المراحل',
              type: 'table',
              table: 'request_stages',
              nameColumn: 'request_id', // 🔥 الربط
            },
          ]}
          DrawerHideFields={['created_at', 'updated_at']}
          DrawerTitle={(row) => (row ? `تفاصيل اللاجئ رقم ${row.id}` : 'تفاصيل اللاجئ')}
          drawerWidth={500}
          DrawerStyle={{ background: '#fafafa' }}
          DrawerActions={[
            <Button key="edit" onClick={() => console.log('edit')}>
              تعديل
            </Button>,
          ]}
          DrawerFooter={(row) => (row ? `آخر تحديث: ${row.updated_at || '—'}` : '—')}
          DrawerTabsVisible={(key) => key !== 'files'}
          customTabRenderer={{}}
          lazyTabs={true}
          initialTab="basic"
          onTabChange={(key) => console.log('Tab:', key)}
          onBeforeOpen={(row) => row.status !== 'blocked'}
          permissions={permissions}  
        />
      </Box>
    </div>
  );
}
