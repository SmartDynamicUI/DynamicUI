import React, { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Divider,
  Tabs,
  Tab,
  Stack,
  Button,
} from "@mui/material";

/**
 * RowDrawer Dynamic v2
 *
 * مكوّن Drawer ديناميكي بالكامل لعرض تفاصيل سجل من الـ SmartDataGrid.
 * يدعم:
 * - Tabs ديناميكية
 * - إخفاء الحقول
 * - Actions في الأعلى
 * - Footer في الأسفل
 * - تخصيص شكل الـ Drawer
 * - custom renderers لكل Tab
 *
 * ملاحظة:
 * هذا المكوّن "عام" ولا يعرف SmartDataGrid من الداخل.
 * كل التحكم يتم عن طريق الـ Props التي يرسلها المكون الأب.
 */
export default function RowDrawer({
  open,
  onClose,
  row,
  schema,

  // Tabs
  DrawerTabs = [],
  DrawerHideFields = [],

  // شكل ومظهر
  DrawerTitle,
  drawerWidth,
  DrawerStyle = {},

  // أزرار عمليات
  DrawerActions = [],

  // Footer ثابت
  DrawerFooter,

  // تحكم متقدم
  DrawerTabsVisible,   // (tabKey, extra?) => boolean
  customTabRenderer = {}, // { [tabKey]: ({ row, schema, tab }) => ReactNode }
  lazyTabs = true,
  initialTab,
  onTabChange,         // (tabKey, tab) => void

  // ملاحظة: onBeforeOpen يفضّل تطبيقه في المكوّن الأب (SmartDataGrid)
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState(initialTab || null);

  // مزامنة حالة الفتح
  useEffect(() => {
    setInternalOpen(open);
  }, [open]);

  // فلترة التابات الظاهرة حسب DrawerTabsVisible
  const visibleTabs = useMemo(() => {
    if (!DrawerTabs || DrawerTabs.length === 0) return [];
    if (!DrawerTabsVisible) return DrawerTabs;

    try {
      return DrawerTabs.filter((tab) =>
        DrawerTabsVisible(tab.key, tab)
      );
    } catch (e) {
      console.warn("DrawerTabsVisible error:", e);
      return DrawerTabs;
    }
  }, [DrawerTabs, DrawerTabsVisible]);

  // اختيار التاب النشط عند تغيير السجل أو التابات
  useEffect(() => {
    if (!visibleTabs || visibleTabs.length === 0) {
      setActiveTabKey(null);
      return;
    }

    // لو initialTab موجود وضمن التابات الظاهرة
    if (initialTab && visibleTabs.some((t) => t.key === initialTab)) {
      setActiveTabKey(initialTab);
      return;
    }

    // لو التاب الحالي لم يعد موجوداً، خذ أول تاب
    if (!activeTabKey || !visibleTabs.some((t) => t.key === activeTabKey)) {
      setActiveTabKey(visibleTabs[0].key);
    }
  }, [row, initialTab, visibleTabs]);

  const handleChangeTab = (_event, newIndex) => {
    const tab = visibleTabs[newIndex];
    if (!tab) return;
    setActiveTabKey(tab.key);
    if (onTabChange) onTabChange(tab.key, tab);
  };

  if (!row || !schema || !schema.columns) {
    return null;
  }

  const effectiveWidth = drawerWidth || { xs: "100vw", sm: 420 };

  const activeTab = activeTabKey
    ? visibleTabs.find((t) => t.key === activeTabKey)
    : visibleTabs[0];

  const renderFormTab = () => {
    return (
      <Box sx={{ mt: 1 }}>
        {schema.columns.map((col) => {
          const colName = col.name || col.column_name;
          if (!colName) return null;

          // إخفاء الأعمدة حسب DrawerHideFields
          if (DrawerHideFields.includes(colName)) {
            return null;
          }

          const label = col.comment || col.label || colName;
          const rawValue = row[colName];
          const value = rawValue === null || rawValue === undefined ? "-" : String(rawValue);

          return (
            <Box key={colName} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {label}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {value}
              </Typography>
              <Divider sx={{ mt: 1 }} />
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderTabContent = (tab) => {
    if (!tab) return null;

    // إن وجد Renderer مخصص لهذا التاب نستخدمه
    if (
      customTabRenderer &&
      typeof customTabRenderer[tab.key] === "function"
    ) {
      return customTabRenderer[tab.key]({ row, schema, tab });
    }

    // التاب الأساسي من النوع form
    if (tab.type === "form" || !tab.type) {
      return renderFormTab();
    }

    // لو النوع grid أو غيره ولم يتم توفير custom renderer
    return (
      <Typography variant="body2" color="text.secondary">
        لا يوجد محتوى مخصص لهذا التبويب ({tab.key}).
      </Typography>
    );
  };

  const titleText =
    typeof DrawerTitle === "function"
      ? DrawerTitle(row)
      : DrawerTitle || `تفاصيل — ID: ${row.id}`;

  return (
    <Drawer anchor="right" open={internalOpen} onClose={onClose}>
      <Box
        sx={{
          width: effectiveWidth,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          ...DrawerStyle,
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {titleText}
            </Typography>

            {DrawerActions && DrawerActions.length > 0 && (
              <Stack direction="row" spacing={1}>
                {DrawerActions.map((action) => (
                  <Button
                    key={action.key}
                    size="small"
                    variant={action.variant || "outlined"}
                    color={action.color || "primary"}
                    onClick={() =>
                      action.onClick && action.onClick(row, action)
                    }
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
            )}
          </Stack>

          <Divider sx={{ mt: 1, mb: 1.5 }} />

          {visibleTabs && visibleTabs.length > 0 && (
            <Tabs
              value={
                activeTab
                  ? visibleTabs.findIndex((t) => t.key === activeTab.key)
                  : 0
              }
              onChange={handleChangeTab}
              variant="scrollable"
              scrollButtons="auto"
            >
              {visibleTabs.map((tab) => (
                <Tab key={tab.key} label={tab.label || tab.key} />
              ))}
            </Tabs>
          )}
        </Box>

        {/* Body */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            px: 2,
            pb: 2,
          }}
        >
          {activeTab && renderTabContent(activeTab)}
        </Box>

        {/* Footer */}
        {DrawerFooter && (
          <Box
            sx={{
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              p: 2,
            }}
          >
            {typeof DrawerFooter === "function"
              ? DrawerFooter(row)
              : DrawerFooter}
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
