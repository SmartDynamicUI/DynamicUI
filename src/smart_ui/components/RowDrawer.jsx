// RowDrawer.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  Box,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Divider,
  Stack,
  Button,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { SmartDataGrid } from "./SmartDataGrid";

// دالة بسيطة لتنسيق القيمة
function formatValue(value) {
  if (value === null || value === undefined) return "—";
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
}

export default function RowDrawer({
  open,
  onClose,
  row,
  table,
  schema,

  DrawerTabs = [],
  DrawerHideFields = [],
  DrawerTitle,
  drawerWidth = 500,
  DrawerStyle = {},
  DrawerActions = [],
  DrawerFooter,
  DrawerTabsVisible,
  customTabRenderer = {},
  lazyTabs = true,
  initialTab,
  onTabChange,
  roles = [],
}) {
  ////////////////////////////////////////////////////////////////////////////
  // ⚠️ IMPORTANT — كل الـ Hooks يجب أن تأتي قبل أي return
  ////////////////////////////////////////////////////////////////////////////

  // Tabs المرئية بناءً على roles + DrawerTabsVisible
  const visibleTabs = useMemo(() => {
    if (!DrawerTabs || DrawerTabs.length === 0) return [];
    return DrawerTabs.filter((tab) =>
      DrawerTabsVisible ? DrawerTabsVisible(tab.key, roles) : true
    );
  }, [DrawerTabs, DrawerTabsVisible, roles]);

  // activeTab
  const [activeTab, setActiveTab] = useState(
    initialTab || (visibleTabs[0]?.key ?? null)
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (visibleTabs.length > 0) {
      const stillExists = visibleTabs.some((t) => t.key === activeTab);
      if (!stillExists) {
        setActiveTab(visibleTabs[0].key);
      }
    }
  }, [row, open, initialTab, visibleTabs, activeTab]);

  const handleChangeTab = (event, newKey) => {
    setActiveTab(newKey);
    if (onTabChange) onTabChange(newKey);
  };

  // schema الحقول الأساسية من
  const tableSchema = schema?.[table] || [];

  const basicFields = useMemo(() => {
    return tableSchema.filter(
      (col) => !DrawerHideFields.includes(col.column_name)
    );
  }, [tableSchema, DrawerHideFields]);

  ////////////////////////////////////////////////////////////////////////////
  // ⚠️ بعد تنفيذ جميع الـ Hooks → الآن مسموح نعمل return للمحتوى
  ////////////////////////////////////////////////////////////////////////////

  if (!row) return null;

  ////////////////////////////////////////////////////////////////////////////
  // UI FUNCTIONS
  ////////////////////////////////////////////////////////////////////////////

  const renderBasicInfo = () => (
    <Grid container spacing={1} sx={{ mt: 1 }}>
      {basicFields.map((col) => (
        <Grid item xs={12} sm={6} key={col.column_name}>
          <Typography variant="caption" color="text.secondary">
            {col.label || col.column_name}
          </Typography>
          <Typography variant="body2">
            {formatValue(row[col.column_name])}
          </Typography>
        </Grid>
      ))}
    </Grid>
  );

  const getFormFieldsForTab = (tab) => {
    const targetTable = tab.table || table;
    const targetSchema = schema?.[targetTable] || [];

    if (tab.FieldsShow && tab.FieldsShow.length > 0) {
      return targetSchema.filter((col) =>
        tab.FieldsShow.includes(col.column_name)
      );
    }

    return targetSchema.filter(
      (col) => !DrawerHideFields.includes(col.column_name)
    );
  };

  const renderFormTab = (tab) => {
    const fields = getFormFieldsForTab(tab);

    return (
      <Box sx={{ mt: 1 }}>
        <Grid container spacing={1}>
          {fields.map((col) => (
            <Grid item xs={12} sm={6} key={col.column_name}>
              <Typography variant="caption" color="text.secondary">
                {col.label || col.column_name}
              </Typography>
              <Typography variant="body2">
                {formatValue(
                  row[col.column_name] ??
                    row[col.alias || col.column_name]
                )}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderGridTab = (tab) => {
    const baseFilter = tab.baseFilter ? tab.baseFilter(row) : {};

    return (
      <Box sx={{ mt: 1 }} >
        <SmartDataGrid
          table={tab.table}
          schema={schema}
          FieldsShow={tab.FieldsShow}
          baseFilter={baseFilter}
          disableDrawer={true}
          initialPageSize={10}
          pageSizeOptions={[10,20,30]}
    initialPage={0}
        />
      </Box>
    );
  };

  const renderTabContent = (tab) => {
    if (customTabRenderer && customTabRenderer[tab.key]) {
      return customTabRenderer[tab.key]({ row, tab });
    }

    if (tab.type === "form") return renderFormTab(tab);
    if (tab.type === "grid") return renderGridTab(tab);

    if (!tab.type || tab.type === "basic") return renderFormTab(tab);

    return (
      <Typography sx={{ mt: 2 }} color="text.secondary">
        لا يوجد محتوى معرف لهذا التاب.
      </Typography>
    );
  };

  const renderTabsBody = () => {
    if (!visibleTabs.length) return renderBasicInfo();

    const activeTabObj = visibleTabs.find((t) => t.key === activeTab);

    if (lazyTabs) {
      return activeTabObj ? renderTabContent(activeTabObj) : null;
    }

    return visibleTabs.map((tab) => (
      <Box
        key={tab.key}
        role="tabpanel"
        hidden={tab.key !== activeTab}
        sx={{ mt: 1 }}
      >
        {tab.key === activeTab && renderTabContent(tab)}
      </Box>
    ));
  };

  const renderTitle = () => {
    if (typeof DrawerTitle === "function") return DrawerTitle(row);
    if (typeof DrawerTitle === "string") return DrawerTitle;
    return `تفاصيل السجل رقم ${row.id ?? ""}`;
  };

  ////////////////////////////////////////////////////////////////////////////
  // DRAWER UI
  ////////////////////////////////////////////////////////////////////////////

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: drawerWidth,
          ...DrawerStyle,
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">{renderTitle()}</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Actions */}
        {DrawerActions?.length > 0 && (
          <>
            <Box sx={{ px: 2, py: 1 }}>
              <Stack direction="row" spacing={1}>
                {DrawerActions.map((action) => (
                  <Button
                    key={action.key}
                    size="small"
                    variant="outlined"
                    onClick={() => action.onClick?.(row)}
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
            </Box>
            <Divider />
          </>
        )}

        {/* Tabs + Content */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {visibleTabs.length > 0 && (
            <>
              <Tabs
                value={activeTab}
                onChange={handleChangeTab}
                variant="scrollable"
                scrollButtons="auto"
              >
                {visibleTabs.map((tab) => (
                  <Tab key={tab.key} label={tab.label} value={tab.key} />
                ))}
              </Tabs>
              <Divider />
            </>
          )}

          <Box sx={{ px: 2, py: 1.5 }}>
            {visibleTabs.length === 0 ? renderBasicInfo() : renderTabsBody()}
          </Box>
        </Box>

        {/* Footer */}
        {DrawerFooter && (
          <>
            <Divider />
            <Box sx={{ px: 2, py: 1 }}>
              {DrawerFooter(row)}
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
