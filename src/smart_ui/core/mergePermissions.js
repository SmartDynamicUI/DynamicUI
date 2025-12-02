// mergePermissions.js
export function mergePermissions(globalPerms, pagePerms) {
  return {
    ...globalPerms,
    ...pagePerms,

    modal: {
      ...globalPerms.modal,
      ...pagePerms.modal,
    },

    tabs: {
      ...globalPerms.tabs,
      ...pagePerms.tabs,
    },

    fields: {
      ...globalPerms.fields,
      ...pagePerms.fields,
    },

    tables: {
      ...globalPerms.tables,
      ...pagePerms.tables,
    },

    defaults: {
      ...globalPerms.defaults,
      ...pagePerms.defaults,
    },
  };
}
