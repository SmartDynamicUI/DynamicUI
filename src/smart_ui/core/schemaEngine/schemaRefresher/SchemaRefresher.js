import { initSchemaEngine } from "../index.js";
export const refreshSchemasInternal = (o={})=> initSchemaEngine({forceRefresh:true,...o});
