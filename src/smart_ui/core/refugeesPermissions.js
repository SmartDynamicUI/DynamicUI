// refugeesPermissions.js
export default {
  modal: {
    open: ['data_entry',  'approver'],
    view: ['data_entry', 'approver'],
    edit: ['data_entry'],
  },

  tabs: {
    basic: {
      view: true,
      edit: ['data_entry'],
    },
    family: {
      view: ['data_entry', 'data_entry'],
      add: ['data_entry', 'data_entry'],
      edit: ['data_entry'],
      delete: ['data_entry'],
    },
    stages: {
      view: true,
    },
  },

  fields: {
    refugees: {
      father_name: { hideFor: ['approver'] },
      nationality: { readonlyFor: ['reviewer'] },
    },
  },

  tables: {
    family_members: {
      add: ['data_entry'],
      edit: ['data_entry'],
      delete: ['data_entry'],
    },
  },
};
