// core/permissions/smartActions.js
// SmartActions V3 — النسخة الموسعة مع دعم صلاحيات الحقول

export const SmartActions = {
  /**
   * يتحقق من الصلاحية العامة (add, edit, delete, view)
   * - modalPerms: إعدادات عامة على مستوى المودال
   * - tabPerms: إعدادات خاصة بكل تبويب
   * - userRoles: أدوار المستخدم الحالية
   */
  can(action, modalPerms = {}, tabPerms = {}, userRoles = []) {
    //---------------------------------------------------------
    // ضمان أن userRoles مصفوفة
    //---------------------------------------------------------
    const rolesArr = Array.isArray(userRoles) ? userRoles : userRoles ? [userRoles] : [];

    //---------------------------------------------------------
    // 1) tab-level override (يقفّل الصلاحية)
    //---------------------------------------------------------
    if (tabPerms[action] === false) return false;

    //---------------------------------------------------------
    // 2) modal-level override (يقفّل الصلاحية)
    //---------------------------------------------------------
    if (modalPerms[action] === false) return false;

    //---------------------------------------------------------
    // 3) لو tabPerms[action] = true → السماح مباشرة
    //---------------------------------------------------------
    if (tabPerms[action] === true) return true;

    //---------------------------------------------------------
    // 4) لو modalPerms[action] = true → السماح مباشرة
    //---------------------------------------------------------
    if (modalPerms[action] === true) return true;

    //---------------------------------------------------------
    // 5) لو tabPerms[action] = array → فقط هذه الأدوار
    //---------------------------------------------------------
    if (Array.isArray(tabPerms[action])) {
      const allowedRoles = tabPerms[action];

      // 🔥 التصحيح الأساسي هنا:
      return rolesArr.some((r) => allowedRoles.includes(r));
    }

    //---------------------------------------------------------
    // 6) لو modalPerms[action] = array → فقط هذه الأدوار
    //---------------------------------------------------------
    if (Array.isArray(modalPerms[action])) {
      const allowedRoles = modalPerms[action];

      // 🔥 نفس التصحيح:
      return rolesArr.some((r) => allowedRoles.includes(r));
    }

    //---------------------------------------------------------
    // 7) إذا لم يتم تحديد أي صلاحيات → السماح تلقائيًا
    //---------------------------------------------------------
    return true;
  },

  /**
   * إرجاع قائمة الحقول المخفية بناءً على:
   * - hideFieldsByRole من permissions
   * - fields[fieldName].hide / hideFor / hideWhen
   */
  getHiddenFields(perms = {}, userRoles = [], context = {}) {
    const rolesArr = Array.isArray(userRoles) ? userRoles : userRoles ? [userRoles] : [];

    const configByRole = perms.hideFieldsByRole || {};
    const fieldsConfig = perms.fields || {};

    let hidden = [];

    // إخفاء حسب الدور
    rolesArr.forEach((role) => {
      if (configByRole[role]) hidden.push(...configByRole[role]);
    });

    // إخفاء حسب إعدادات الحقول
    Object.entries(fieldsConfig).forEach(([fieldName, cfg]) => {
      let shouldHide = false;

      if (cfg.hide === true) shouldHide = true;

      if (!shouldHide && Array.isArray(cfg.hideFor)) {
        if (rolesArr.some((r) => cfg.hideFor.includes(r))) {
          shouldHide = true;
        }
      }

      if (!shouldHide && typeof cfg.hideWhen === 'function') {
        try {
          if (cfg.hideWhen(context.formData || {}, context.row || null)) {
            shouldHide = true;
          }
        } catch (e) {
          console.warn('SmartActions.hideWhen error for field:', fieldName, e);
        }
      }

      if (shouldHide) hidden.push(fieldName);
    });

    // إزالة التكرار
    return Array.from(new Set(hidden));
  },

  /**
   * إرجاع إعدادات حقل واحد (قراءة / Required) بناءً على الدور + الكونتكست
   *
   * fieldConfig:
   *  - readonly / readonlyFor / disableOnEdit / disableOnEditFor
   *  - required / requiredFor / requiredWhen
   */
  getFieldBehavior(perms = {}, fieldName, userRoles = [], context = {}) {
    const rolesArr = Array.isArray(userRoles) ? userRoles : userRoles ? [userRoles] : [];

    const fieldsConfig = perms.fields || {};
    const cfg = fieldsConfig[fieldName] || {};

    const { formData = {}, row = null, mode = 'view' } = context;

    let readOnly = false;
    let requiredOverride;

    // -------- READONLY / DISABLE ON EDIT --------
    if (cfg.readonly === true) {
      readOnly = true;
    }

    if (!readOnly && Array.isArray(cfg.readonlyFor)) {
      if (rolesArr.some((r) => cfg.readonlyFor.includes(r))) {
        readOnly = true;
      }
    }

    // disableOnEdit يعمل فقط في وضع التعديل
    if (!readOnly && mode !== 'view' && cfg.disableOnEdit === true) {
      readOnly = true;
    }

    if (
      !readOnly &&
      mode !== 'view' &&
      Array.isArray(cfg.disableOnEditFor) &&
      rolesArr.some((r) => cfg.disableOnEditFor.includes(r))
    ) {
      readOnly = true;
    }

    // -------- REQUIRED --------
    if (typeof cfg.required === 'boolean') {
      requiredOverride = cfg.required;
    }

    if (!requiredOverride && Array.isArray(cfg.requiredFor)) {
      if (rolesArr.some((r) => cfg.requiredFor.includes(r))) {
        requiredOverride = true;
      }
    }

    if (!requiredOverride && typeof cfg.requiredWhen === 'function') {
      try {
        if (cfg.requiredWhen(formData, row)) {
          requiredOverride = true;
        }
      } catch (e) {
        console.warn('SmartActions.requiredWhen error for field:', fieldName, e);
      }
    }

    // -------- Hide in View فقط --------
    let hideInView = false;
    if (cfg.hideInView === true) hideInView = true;

    if (!hideInView && Array.isArray(cfg.hideInViewFor)) {
      if (rolesArr.some((r) => cfg.hideInViewFor.includes(r))) {
        hideInView = true;
      }
    }

    if (!hideInView && typeof cfg.hideInViewWhen === 'function') {
      try {
        if (cfg.hideInViewWhen(formData, row)) hideInView = true;
      } catch (e) {
        console.warn('SmartActions.hideInViewWhen error for field:', fieldName, e);
      }
    }

    return {
      readOnly,
      requiredOverride,
      hideInView,
    };
  },
};
