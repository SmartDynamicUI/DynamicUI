
// useModalTabs.js
import { useEffect, useMemo, useState } from 'react';
import { SmartActions } from '../../core/permissions/smartActions';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:9001';

/**
 * Hook لإدارة تبويبات SmartModal:
 * - activeTab
 * - visibleTabs (مع DrawerTabsVisible + roles + SmartActions)
 * - tabData / tabLoading / tabError
 * - loadTabData (مع lazyTabs + demoMode)
 */
export function useModalTabs({
  open,
  row,
  table,
  schema,
  DrawerTabs = [],
  DrawerTabsVisible,
  roles = [],
  lazyTabs = true,
  demoMode = false,
  initialTab,
}) {
  const [activeTab, setActiveTab] = useState(initialTab || null);
  const [tabData, setTabData] = useState({});
  const [tabLoading, setTabLoading] = useState({});
  const [tabError, setTabError] = useState({});

  // تأمين roles كمصفوفة دائمًا
  const userRoles = Array.isArray(roles) ? roles : roles ? [roles] : [];

  // ====== فلترة التابات حسب DrawerTabsVisible + SmartActions (view) ======
  const visibleTabs = useMemo(() => {
    return (DrawerTabs || []).filter((t) => {
      const visibleByFn = DrawerTabsVisible
        ? DrawerTabsVisible(t.key, userRoles)
        : true;
      const visibleByPerms = SmartActions.can(
        'view',
        {},
        t.permissions || {},
        userRoles
      );
      return visibleByFn && visibleByPerms;
    });
  }, [DrawerTabs, DrawerTabsVisible, userRoles]);

  // ====== اختيار التاب الافتراضي عند فتح المودال ======
  useEffect(() => {
    if (!open) return;

    if (initialTab && visibleTabs.some((t) => t.key === initialTab)) {
      setActiveTab(initialTab);
      return;
    }

    if (visibleTabs.length > 0) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [open, initialTab, visibleTabs]);

  // ====== تنظيف بيانات التابات عند إغلاق المودال ======
  useEffect(() => {
    if (!open) return;

    // لا نمسح شيء عند الفتح
    return () => {
      // عند الإغلاق
      setTabData({});
      setTabLoading({});
      setTabError({});
    };
  }, [open]);

  // ====== دوال مساعدة داخلية ======
  const getTemplate = (tableName) => {
    if (!schema || !tableName) return {};
    return schema[tableName]?.objectTemplate || {};
  };

  // ====== الدالة الأساسية لجلب بيانات تاب معيّن (بالـ object نفسه) ======
  const loadTabDataForObject = async (tab) => {
    if (!tab) return;

    const { key, type, table: tabTable, nameColumn } = tab;
    const tableName = tabTable || table;

    console.log(
      'TAB DEBUG → table:',
      tableName,
      'type:',
      type,
      'nameColumn:',
      nameColumn,
      'row.id:',
      row?.id
    );

    // DEMO MODE: بدون API
    if (demoMode) {
      console.log('DEMO MODE → using schema only');
      if (type === 'form') {
        setTabData((prev) => ({
          ...prev,
          [key]: { details: getTemplate(tableName) },
        }));
      } else if (type === 'table') {
        setTabData((prev) => ({ ...prev, [key]: { rows: [] } }));
      }
      return;
    }

    if (!row) return;

    // lazyTabs: لو البيانات محملة من قبل لا نعيد الجلب
    if (lazyTabs && tabData[key]) return;

    // form للجدول الرئيسي: استخدم row مباشرة
    if (type === 'form' && (tableName === table || !tabTable)) {
      console.log('FORM BASIC → Using main row:', row);
      setTabData((prev) => ({ ...prev, [key]: { details: row } }));
      return;
    }

    try {
      setTabLoading((prev) => ({ ...prev, [key]: true }));
      setTabError((prev) => ({ ...prev, [key]: null }));

      let url = '';

      if (type === 'table') {
        if (!nameColumn) {
          console.log('ERROR → nameColumn missing');
          setTabError((prev) => ({
            ...prev,
            [key]: 'nameColumn غير معرّف.',
          }));
          return;
        }
        url = `${API_BASE_URL}/mains/${tableName}/${nameColumn}/${row.id}`;
      } else if (type === 'form') {
        if (!nameColumn) {
          console.log('ERROR → nameColumn missing for form');
          setTabError((prev) => ({
            ...prev,
            [key]: 'nameColumn غير معرّف.',
          }));
          return;
        }
        url = `${API_BASE_URL}/mains/${tableName}/${nameColumn}/${row.id}`;
      }

      console.log('FETCH URL:', url);

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      console.log('API RAW RESPONSE:', data);

      const payloadRecords = data?.data?.records;
      console.log('API RECORDS:', payloadRecords);

      const firstRecord =
        Array.isArray(payloadRecords) && payloadRecords.length > 0
          ? payloadRecords[0]
          : null;

      if (type === 'form') {
        const details = firstRecord || data?.data || null;
        console.log('FORM SET DATA:', details);
        setTabData((prev) => ({ ...prev, [key]: { details } }));
      } else if (type === 'table') {
        const rows = Array.isArray(payloadRecords)
          ? payloadRecords
          : data?.data || [];
        console.log('SET TAB DATA → key:', key, 'rows:', rows);
        setTabData((prev) => ({ ...prev, [key]: { rows } }));
      }
    } catch (err) {
      console.error('SmartModal loadTabData error:', err);
      setTabError((prev) => ({ ...prev, [tab.key]: err?.message }));
    } finally {
      setTabLoading((prev) => ({ ...prev, [tab.key]: false }));
    }
  };

  // ====== دالة عامة تستقبل key للتاب (للاستخدام من SmartModal أو Tabs) ======
  const loadTabData = async (tabKey) => {
    const tab = visibleTabs.find((t) => t.key === tabKey);
    if (!tab) return;
    await loadTabDataForObject(tab);
  };

  // ====== Auto-load للتاب الحالي عند تغيّر activeTab أو open ======
  useEffect(() => {
    if (!open) return;
    if (!activeTab) return;

    const tab = visibleTabs.find((t) => t.key === activeTab);
    if (!tab) return;

    if (!lazyTabs || !tabData[activeTab]) {
      loadTabDataForObject(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeTab, visibleTabs, lazyTabs, row, demoMode]);

  return {
    activeTab,
    setActiveTab,
    visibleTabs,
    tabData,
    tabLoading,
    tabError,
    loadTabData, // تستقبل tabKey (مثل "family")
  };
}
