import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Box,
  Stack,
  Typography,
  Divider,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// يمكنك ضبطه من .env مثلاً REACT_APP_API_BASE_URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:9001';

/**
 * SmartModal
 *
 * props:
 * - open
 * - onClose
 * - row           ← السجل المختار من الـ SmartDataGrid (refugees)
 * - table         ← اسم الجدول الرئيسي (مثلاً "refugees")
 * - schema        ← كائن السكيما الكامل (memoryCache.schemas)
 *
 * - DrawerTabs    ← تعريف التابات (key, label, type, table, nameColumn, ...الخ)
 * - DrawerHideFields ← مصفوفة أسماء الحقول المراد إخفاؤها
 * - DrawerTitle   ← دالة (row) => string
 * - modalWidth    ← عرض المودال (بدل drawerWidth)
 * - ModalStyle    ← ستايل إضافي (sx) لمحتوى الـ Dialog
 *
 * - DrawerActions ← أزرار أعلى أو أسفل (array of { key,label,onClick })
 * - DrawerFooter  ← دالة (row) => ReactNode
 *
 * - DrawerTabsVisible ← (tabKey, roles) => boolean
 * - customTabRenderer ← { [tabKey]: (ctx) => ReactNode }
 *
 * - lazyTabs      ← إن كان true لا يجلب بيانات التاب حتى يفتَح
 * - initialTab    ← key التاب الأولي (مثلاً "basic")
 * - onTabChange   ← (key) => void
 * - roles         ← أدوار المستخدم (لدعم الصلاحيات)
 */
export default function SmartModal({
  open,
  onClose,
  row,
  table,
  schema,

  DrawerTabs = [],
  DrawerHideFields = [],
  DrawerTitle,
  modalWidth = 900,
  ModalStyle = {},

  DrawerActions = [],
  DrawerFooter,
  DrawerTabsVisible,
  customTabRenderer = {},

  lazyTabs = true,
  initialTab,
  onTabChange,
  roles = [],
}) {
  const [activeTab, setActiveTab] = useState(initialTab || null);
  const [tabData, setTabData] = useState({}); // { tabKey: { details?, rows? } }
  const [tabLoading, setTabLoading] = useState({});
  const [tabError, setTabError] = useState({});

  // ========== 1) فلترة التابات حسب الصلاحيات / visible fn ==========
  const visibleTabs = useMemo(() => {
    return (DrawerTabs || []).filter((t) => {
      if (!DrawerTabsVisible) return true;
      return DrawerTabsVisible(t.key, roles);
    });
  }, [DrawerTabs, DrawerTabsVisible, roles]);

  // ========== 2) تهيئة التاب النشط عند الفتح ==========
  useEffect(() => {
    if (!open) return;

    // إذا عندك initialTab ويكون موجود ضمن التابات المرئية
    if (initialTab && visibleTabs.some((t) => t.key === initialTab)) {
      setActiveTab(initialTab);
      return;
    }

    // وإلا خله أول تاب ظاهر
    if (visibleTabs.length > 0) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [open, initialTab, visibleTabs]);

  // reset data عند إغلاق المودال
  useEffect(() => {
    if (!open) {
      setTabData({});
      setTabLoading({});
      setTabError({});
    }
  }, [open]);

  // ========== 3) أدوات مساعدة على مستوى السكيما ==========
  const getColumnsForTable = (tableName) => {
    if (!schema || !tableName) return [];
    const t = schema[tableName];
    if (!t) return [];
    if (Array.isArray(t.columns)) return t.columns;
    // احتياط: لو كان t نفسه array
    if (Array.isArray(t)) return t;
    return [];
  };

  const isFieldHidden = (fieldName) => {
    if (!fieldName) return false;
    return DrawerHideFields.includes(fieldName);
  };

  // ========== 4) جلب بيانات التاب ==========
  const loadTabData = async (tab) => {
    if (!tab || !row) return;

    const { key, type, table: tabTable, nameColumn } = tab;
    const tableName = tabTable || table;

    if (!tableName) return;

    // لو عندنا بيانات محفوظة سابقاً وهذا Lazy
    if (lazyTabs && tabData[key]) {
      return;
    }

    // basic / نفس جدول refugees → نستخدم row مباشرة في form
    if (type === 'form' && (tableName === table || !tabTable)) {
      setTabData((prev) => ({
        ...prev,
        [key]: { details: row },
      }));
      return;
    }

    // table أو form من جدول فرعي
    try {
      setTabLoading((prev) => ({ ...prev, [key]: true }));
      setTabError((prev) => ({ ...prev, [key]: null }));

      let url = '';

      if (type === 'table') {
        // ⚡ حسب اختيارك A:
        // GET /api/mains/{table}/{nameColumn}/{row.id}
        if (!nameColumn) {
          setTabError((prev) => ({
            ...prev,
            [key]: 'nameColumn غير معرّف لهذا التاب.',
          }));
          setTabLoading((prev) => ({ ...prev, [key]: false }));
          return;
        }
        url = `${API_BASE_URL}/api/mains/${tableName}/${nameColumn}/${row.id}`;
      } else if (type === 'form') {
        // form من جدول آخر → نستخدم /id/:id (سجل واحد عادةً)
        url = `${API_BASE_URL}/api/mains/${tableName}/id/${row.id}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // شكل الاستجابة اللي عندك:
      // { success, msg, data: { records: [...], columns, object }, err }
      const payloadRecords = data?.data?.records;
      const firstRecord = Array.isArray(payloadRecords) && payloadRecords.length > 0 ? payloadRecords[0] : null;

      if (type === 'form') {
        const details = firstRecord || data?.data || null;
        setTabData((prev) => ({
          ...prev,
          [key]: { details },
        }));
      } else if (type === 'table') {
        const rows = Array.isArray(payloadRecords) ? payloadRecords : data?.data || [];
        setTabData((prev) => ({
          ...prev,
          [key]: { rows },
        }));
      }
    } catch (err) {
      console.error('SmartModal loadTabData error:', err);
      setTabError((prev) => ({
        ...prev,
        [tab.key]: err?.message || 'فشل جلب بيانات التاب.',
      }));
    } finally {
      setTabLoading((prev) => ({ ...prev, [tab.key]: false }));
    }
  };

  // تحميل التاب النشط عند تغييره
  useEffect(() => {
    if (!open) return;
    if (!activeTab) return;

    const tab = visibleTabs.find((t) => t.key === activeTab);
    if (!tab) return;

    if (!lazyTabs || !tabData[activeTab]) {
      loadTabData(tab);
    }
  }, [open, activeTab, visibleTabs, lazyTabs, row]); // eslint-disable-line react-hooks/exhaustive-deps

  // ========== 5) تغيير التاب ==========
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (onTabChange) onTabChange(newValue);
  };

  // ========== 6) Renderer للحقول (form) ==========
  const renderValue = (val) => {
    if (val === null || val === undefined || val === '') return '—';
    // لو كان تاريخ string ISO بسيط جدًا تقدر تعالجه هنا مستقبلاً
    return String(val);
  };

  const renderFormTab = (tab, details) => {
    const tableName = tab.table || table;
    const cols = getColumnsForTable(tableName);

    if (!cols || cols.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          لا توجد حقول معرّفة في السكيما لهذا الجدول ({tableName}).
        </Typography>
      );
    }

    return (
      <Box sx={{ mt: 1 }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem',
          }}
        >
          <tbody>
            {cols
              .filter((col) => !isFieldHidden(col.name))
              .map((col) => (
                <tr key={col.name}>
                  <td
                    style={{
                      width: '30%',
                      padding: '6px 8px',
                      borderBottom: '1px solid #eee',
                      fontWeight: 600,
                      background: '#fafafa',
                    }}
                  >
                    {col.comment || col.name}
                  </td>
                  <td
                    style={{
                      padding: '6px 8px',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    {renderValue(details ? details[col.name] : undefined)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Box>
    );
  };

  // ========== 7) Renderer للـ TABLE tabs ==========
  const renderTableTab = (tab, rows) => {
    const tableName = tab.table || table;
    const cols = getColumnsForTable(tableName);

    if (!cols || cols.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          لا توجد حقول معرّفة في السكيما لهذا الجدول ({tableName}).
        </Typography>
      );
    }

    return (
      <Box sx={{ mt: 1, overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
          }}
        >
          <thead>
            <tr>
              {cols
                .filter((col) => !isFieldHidden(col.name))
                .map((col) => (
                  <th
                    key={col.name}
                    style={{
                      padding: '6px 8px',
                      borderBottom: '1px solid #ddd',
                      textAlign: 'left',
                      background: '#f5f5f5',
                      fontWeight: 700,
                    }}
                  >
                    {col.comment || col.name}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {rows && rows.length > 0 ? (
              rows.map((r, idx) => (
                <tr
                  key={r.id || idx}
                  style={{
                    background: idx % 2 === 0 ? '#fff' : '#fcfcfc',
                  }}
                >
                  {cols
                    .filter((col) => !isFieldHidden(col.name))
                    .map((col) => (
                      <td
                        key={col.name}
                        style={{
                          padding: '6px 8px',
                          borderBottom: '1px solid #eee',
                        }}
                      >
                        {renderValue(r[col.name])}
                      </td>
                    ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={cols.filter((c) => !isFieldHidden(c.name)).length || 1}
                  style={{
                    padding: '10px',
                    textAlign: 'center',
                    color: '#777',
                  }}
                >
                  لا توجد بيانات مرتبطة لهذا السجل.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>
    );
  };

  // ========== 8) محتوى التاب بحسب النوع ==========
  const renderActiveTabContent = () => {
    if (!activeTab) return null;

    const tab = visibleTabs.find((t) => t.key === activeTab);
    if (!tab) return null;

    // لو عندك custom renderer لها الأولوية
    const customRenderer = customTabRenderer[tab.key];
    if (typeof customRenderer === 'function') {
      return customRenderer({
        row,
        tab,
        tableName: tab.table || table,
        schema,
        data: tabData[tab.key],
      });
    }

    const loading = tabLoading[tab.key];
    const error = tabError[tab.key];
    const dataForTab = tabData[tab.key] || {};

    if (loading) {
      return (
        <Typography variant="body2" color="text.secondary">
          جاري تحميل بيانات التاب...
        </Typography>
      );
    }

    if (error) {
      return (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      );
    }

    // نوع FORM
    if (tab.type === 'form') {
      return renderFormTab(tab, dataForTab.details || row);
    }

    // نوع TABLE
    if (tab.type === 'table') {
      return renderTableTab(tab, dataForTab.rows || []);
    }

    return (
      <Typography variant="body2" color="text.secondary">
        نوع التاب غير مدعوم: {tab.type}
      </Typography>
    );
  };

  // ========== 9) عنوان المودال ==========
  const resolvedTitle = (DrawerTitle && row && DrawerTitle(row)) || 'تفاصيل السجل';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: modalWidth,
          maxWidth: '95vw',
          ...ModalStyle,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 1,
        }}
      >
        <Typography variant="h6">{resolvedTitle}</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 0 }}>
        {/* أزرار عليا اختيارية */}
        {DrawerActions && DrawerActions.length > 0 && (
          <>
            <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }} justifyContent="flex-start">
              {DrawerActions.map((action) => (
                <Button
                  key={action.key}
                  size="small"
                  variant="outlined"
                  onClick={() => action.onClick && action.onClick(row)}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
            <Divider />
          </>
        )}

        {/* Tabs شريط */}
        {visibleTabs.length > 0 && (
          <Tabs
            value={activeTab || (visibleTabs[0] && visibleTabs[0].key)}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}
          >
            {visibleTabs.map((t) => (
              <Tab key={t.key} label={t.label} value={t.key} />
            ))}
          </Tabs>
        )}

        {/* محتوى التاب */}
        <Box sx={{ mt: 1 }}>{renderActiveTabContent()}</Box>

        {/* Footer اختياري */}
        {DrawerFooter && (
          <>
            <Divider sx={{ mt: 2, mb: 1 }} />
            <Box sx={{ mt: 1 }}>{DrawerFooter(row)}</Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
