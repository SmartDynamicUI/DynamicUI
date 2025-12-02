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
  permissions = {},        // 👈 الصلاحيات النهائية
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

      // 👈 هنا نقرأ صلاحيات التاب من permissions.tabs[key]
      const tabPerms = permissions?.tabs?.[t.key] || {};
      const visibleByPerms = SmartActions.can('view', {}, tabPerms, userRoles);

      return visibleByFn && visibleByPerms;
    });
  }, [DrawerTabs, DrawerTabsVisible, permissions, userRoles]);

  // ====== اختيار التاب الافتراضي عند فتح المودال ======
  useEffect(() => {
    if (!open) return;

    if (initialTab && visibleTabs.some((t) => t.key === initialTab)) {
      setActiveTab(initialTab);
    } else if (visibleTabs.length > 0) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [open, initialTab, visibleTabs]);

  // ====== تحميل بيانات تبويب معيّن ======
  const loadTabData = async (key) => {
    const tab = (DrawerTabs || []).find((t) => t.key === key);
    if (!tab) return;

    const { type = 'form', table: tabTable, nameColumn } = tab;

    const tableName = tabTable || table;

    if (demoMode) {
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
            [key]: 'nameColumn غير معرّف للنموذج.',
          }));
          return;
        }
        url = `${API_BASE_URL}/mains/${tableName}/${nameColumn}/${row.id}`;
      }

      console.log('FETCH URL:', url);

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      setTabData((prev) => ({
        ...prev,
        [key]: json?.Data || {},
      }));
    } catch (err) {
      console.error(err);
      setTabError((prev) => ({
        ...prev,
        [key]: err.message || String(err),
      }));
    } finally {
      setTabLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return {
    activeTab,
    setActiveTab,
    visibleTabs,
    tabData,
    tabLoading,
    tabError,
    loadTabData,
  };
}
