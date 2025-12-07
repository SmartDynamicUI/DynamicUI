import * as React from 'react';
import { useEffect, useState, useCallback, useMemo, useContext } from 'react';
import { Drawer, Button, IconButton, Divider, Grid, Avatar, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useApi } from '../utils';
import { DangerMsg } from '../components/NotificationMsg';
import { Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { ar, vi } from 'date-fns/locale';
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
import { memoryCache } from '../smart_ui/core/schemaEngine/schemaCache/SchemaCache';
import { add } from 'lodash';

const API_BASE_URL = process.env.REACT_APP_SCHEMA_ENDPOINT;

export default function RefugeesGrid() {
  const api = useApi();
  const { user } = useContext(appContext);
  const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.roles].filter(Boolean);

  const [schema, setSchema] = useState(null);
  const [columns, setColumns] = useState([]);
  const [template, setTemplate] = useState({});
  const [fields, setFields] = useState([]);

  // دمج الصلاحيات العامة + الخاصة بصفحة اللاجئين
  const refugeesPermissions = {
    modal: {
      open: ['data_entry', 'reviewer'],
      edit: ['data_entry'],
      view: ['approver'],
      fullscreen: true,
      print: ['data_entry', 'approver'],
    },
    tabs: {
      basic: {
        view: true,
        edit: ['data_entry'],
      },
      family: {
        view: true,
        add: ['data_entry'],
        edit: ['data_entry'],
        delete: ['data_entry'],
      },
      stages: {
        view: true,
        add: false,
        edit: false,
        delete: false,
      },
    },

    fields: {
      refugees_v: {
        father_name: { hideFor: ['data_entry'] },
        nationality: { readonlyFor: ['data_entry'] },
      },
    },
  };

  useEffect(() => {
    async function load() {
      await initSchemaEngine({ endpointOverride: API_BASE_URL });
      setSchema(memoryCache.schemas);
    }
    load();
  }, []);

  const uiSchema = useMemo(() => {
    if (!schema) return null;

    const out = {};
    for (let table in schema) {
      out[table] = schema[table].columns;
    }
    return out;
  }, [schema]);

  if (!schema) return <div>Loading...</div>;

  console.log('[RefugeesGrid] user =', user);
  console.log('[RefugeesGrid] userRoles =', userRoles);

  return (
    <div style={{ padding: 20 }}>
      <h2>
        Schema Example Me testing user roles:
        <p> {userRoles} </p>
      </h2>

      <Box sx={{ height: 'calc(100vh - 200px)' }}>
        <SmartDataGrid
          table="refugees_v"
          schema={schema}
          permissions={refugeesPermissions} // 👈 هذا أهم شيء
          FieldsShow={['id', 'frist_name', 'gender', 'gov_name', 'status', 'created_at']}
          DrawerTabs={[
            {
              key: 'basic',
              label: 'الأساسي',
              type: 'form',
              table: 'refugees_v',
            },
            {
              key: 'family',
              label: 'أفراد العائلة',
              type: 'table',
              table: 'family_members',
              nameColumn: 'refugee_id',
            },
            {
              key: 'stages',
              label: 'المراحل',
              type: 'table',
              table: 'request_stages',
              nameColumn: 'request_id',
            },
          ]}
          DrawerHideFields={['created_at', 'updated_at', 'created_by']}
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
          userRoles={userRoles} // 👈 أدوار المستخدم
        />
      </Box>
    </div>
  );
}
