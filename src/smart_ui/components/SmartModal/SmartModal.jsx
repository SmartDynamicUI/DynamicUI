import React from 'react';
import { Box, Modal, Tabs, Tab, CircularProgress, Typography } from '@mui/material';

import { useModalTabs } from './useModalTabs';
import { TableTabRenderer } from './TableTabRenderer';
import BasicTabRenderer from './BasicTabRenderer';

export default function SmartModal({
  open,
  onClose,
  table,
  row,
  schema,
  DrawerTabs = [],
  DrawerHideFields = [],
  DrawerTabsVisible,
  DrawerTitle,
  DrawerFooter,
  roles = [],
  lazyTabs = true,
  initialTab,
  demoMode = false,
  permissions = {}, // ✔ يجب إضافتها هنا
}) {
  // ⬅️ Hook: إدارة التابات + البيانات + التحميل
  const { activeTab, setActiveTab, visibleTabs, tabData, tabLoading, tabError, loadTabData } = useModalTabs({
    open,
    row,
    table,
    schema,
    DrawerTabs,
    DrawerTabsVisible,
    roles,
    lazyTabs,
    demoMode,
    initialTab,
    permissions,
  });

  // تأمين roles كمصفوفة
  const userRoles = Array.isArray(roles) ? roles : roles ? [roles] : [];

  // ⬅️ الحصول على التاب الحالي
  const currentTab = visibleTabs.find((t) => t.key === activeTab);

  // =============================
  // Header
  // =============================
  const renderHeader = () => {
    const title = DrawerTitle ? DrawerTitle(row) : 'التفاصيل';
    return (
      <Box
        sx={{
          padding: 2,
          fontWeight: 'bold',
          fontSize: 20,
          borderBottom: '1px solid #eee',
        }}
      >
        {title}
      </Box>
    );
  };

  // =============================
  // محتوى التاب الحالي
  // =============================
  const renderTabContent = () => {
    if (!currentTab) {
      return (
        <Box sx={{ padding: 2 }}>
          <Typography color="error">لا يوجد تبويب نشط.</Typography>
        </Box>
      );
    }

    const { key, type } = currentTab;
    const dataObj = tabData[key] || {};

    // 🔄 Loading
    if (tabLoading[key]) {
      return (
        <Box sx={{ padding: 2, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      );
    }

    // ⚠ Error
    if (tabError[key]) {
      return <Box sx={{ padding: 2, color: 'red' }}>خطأ في تحميل البيانات: {tabError[key]}</Box>;
    }

    // 🟦 FORM TAB → BasicTabRenderer مع إدارة الحقول
    if (type === 'form') {
      const tableName = currentTab.table || table;

      // دمج الحقول المخفية: من المودال + من التاب نفسه
      const mergedHideFields = [...(DrawerHideFields || []), ...(currentTab.hideFields || [])];

      const details = dataObj.details || row || null;

      return (
        <Box sx={{ padding: 2 }}>
          <BasicTabRenderer
            row={details}
            schema={schema}
            tableName={tableName}
            hideFields={mergedHideFields}
            userRoles={userRoles}
            permissions={currentTab.permissions || {}}
          />
        </Box>
      );
    }

    // 🟧 TABLE TAB (nested table)
    if (type === 'table') {
      const rows = dataObj.rows || [];
      return (
        <Box sx={{ padding: 2 }}>
          <TableTabRenderer rows={rows} tab={currentTab} schema={schema} row={row} roles={userRoles} />
        </Box>
      );
    }

    return (
      <Box sx={{ padding: 2 }}>
        <Typography>النوع "{type}" غير مدعوم حالياً.</Typography>
      </Box>
    );
  };

  // =============================
  // Footer
  // =============================
  const renderFooter = () => {
    if (!DrawerFooter) return null;
    return <Box sx={{ padding: 2, borderTop: '1px solid #eee' }}>{DrawerFooter(row)}</Box>;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 780,
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: 'white',
          margin: '40px auto',
          borderRadius: 2,
          boxShadow: 4,
        }}
      >
        {renderHeader()}

        {/* التابات */}
        <Tabs
          value={activeTab}
          onChange={(e, val) => {
            setActiveTab(val);
            loadTabData(val);
          }}
          sx={{ borderBottom: '1px solid #ddd' }}
        >
          {visibleTabs.map((tab) => (
            <Tab key={tab.key} label={tab.label} value={tab.key} />
          ))}
        </Tabs>

        {/* المحتوى */}
        <Box sx={{ minHeight: 200 }}>{renderTabContent()}</Box>

        {renderFooter()}
      </Box>
    </Modal>
  );
}
