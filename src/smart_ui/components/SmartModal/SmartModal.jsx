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
  DrawerTitle,
  DrawerActions = [],
  DrawerFooter,
  DrawerTabsVisible,
  customTabRenderer = {},
  lazyTabs = true,
  initialTab,
  demoMode = false,
  roles = [],
  permissions = {},       // 👈 الصلاحيات النهائية (global + page)
}) {
  // 🧠 Hook: إدارة التابات
  const {
    activeTab,
    setActiveTab,
    visibleTabs,
    tabData,
    tabLoading,
    tabError,
    loadTabData,
  } = useModalTabs({
    open,
    row,
    table,
    schema,
    DrawerTabs,
    DrawerTabsVisible,
    roles,
    permissions,
    lazyTabs,
    demoMode,
    initialTab,
  });

  // تحويل roles إلى array دائمًا
  const userRoles = Array.isArray(roles) ? roles : roles ? [roles] : [];

  // ============= HEADER =============
  const renderHeader = () => {
    const title =
      typeof DrawerTitle === 'function'
        ? DrawerTitle(row)
        : DrawerTitle || 'تفاصيل السجل';

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

  // ============= تبويبة المحتوى =============
  const renderTabContent = () => {
    if (!visibleTabs || visibleTabs.length === 0) {
      return (
        <Box sx={{ padding: 2 }}>
          <Typography>لا توجد تبويبات متاحة.</Typography>
        </Box>
      );
    }

    const currentTab =
      visibleTabs.find((t) => t.key === activeTab) || visibleTabs[0];

    if (!currentTab) {
      return (
        <Box sx={{ padding: 2 }}>
          <Typography>لم يتم العثور على التاب الحالي.</Typography>
        </Box>
      );
    }

    const key = currentTab.key;
    const type = currentTab.type || 'form';

    const dataObj = tabData[key] || {};
    const isLoading = tabLoading[key];
    const error = tabError[key];

    if (isLoading) {
      return (
        <Box sx={{ padding: 2, textAlign: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ padding: 2 }}>
          <Typography color="error">{String(error)}</Typography>
        </Box>
      );
    }

    // FORM TAB
    if (type === 'form') {
      const tableName = currentTab.table || table;

      const mergedHideFields = [
        ...(DrawerHideFields || []),
        ...(currentTab.hideFields || []),
      ];

      const details = dataObj.details || row || null;

      return (
        <Box sx={{ padding: 2 }}>
          <BasicTabRenderer
            row={details}
            schema={schema}
            tableName={tableName}
            hideFields={mergedHideFields}
            userRoles={userRoles}
            permissions={permissions}     // 👈 الصلاحيات
          />
        </Box>
      );
    }

    // TABLE TAB
    if (type === 'table') {
      const rows = dataObj.rows || [];
      return (
        <Box sx={{ padding: 2 }}>
          <TableTabRenderer
            rows={rows}
            tab={currentTab}
            schema={schema}
            row={row}
            roles={userRoles}
            permissions={permissions}     // 👈 الصلاحيات
          />
        </Box>
      );
    }

    return (
      <Box sx={{ padding: 2 }}>
        <Typography>النوع "{type}" غير مدعوم حالياً.</Typography>
      </Box>
    );
  };

  // ============= FOOTER =============
  const renderFooter = () => {
    const footerText =
      typeof DrawerFooter === 'function' ? DrawerFooter(row) : DrawerFooter;

    if (!DrawerActions?.length && !footerText) return null;

    return (
      <Box
        sx={{
          borderTop: '1px solid #eee',
          padding: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>{DrawerActions}</Box>
        {footerText && (
          <Typography variant="body2" color="text.secondary">
            {footerText}
          </Typography>
        )}
      </Box>
    );
  };

  if (!open) return null;

  // ===================== 👇 إصلاح الخطأ هنا 👇 =====================
  const safeTabs = Array.isArray(visibleTabs) ? visibleTabs : [];

  // ==================================================================

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (typeof loadTabData === 'function') {
      loadTabData(newValue);
    }
  };
console.log('SmartModal visibleTabs = ', visibleTabs, 'activeTab = ', activeTab);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          right: 40,
          top: 40,
          bottom: 40,
          width: 700,
          bgcolor: 'background.paper',
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        {renderHeader()}

        {/* Tabs Header */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: '1px solid #ddd' }}
        >
          {safeTabs.map((tab) => (
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
