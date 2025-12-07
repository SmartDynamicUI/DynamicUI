import { getSchemaEndpoint } from './config/ApiConfig.js';
import { fetchAllSchemas } from './schemaApi/SchemaApi.js';
import { normalizeAllSchemas } from './schemaNormalizer/SchemaNormalizer.js';
import {
  loadFromLocal,
  saveAllToCache,
  getLastUpdated,
  setLastUpdated,
  memoryCache,
} from './schemaCache/SchemaCache.js';
import { isExpired, nowTimestamp, TWELVE_HOURS_MS } from './schemaTTL/SchemaTTL.js';
import {
  getSchemaInternal,
  getColumnsInternal,
  getObjectTemplateInternal,
  getFieldsInternal,
} from './schemaStore/SchemaStore.js';
import { emit, on, off } from './events/EventBus.js';

export async function initSchemaEngine(options = {}) {
  const { forceRefresh = false, endpointOverride } = options;

  const hadLocal = loadFromLocal();
  const lastUpdated = getLastUpdated();
  const expired = !lastUpdated || isExpired(lastUpdated, TWELVE_HOURS_MS);

  if (hadLocal && !forceRefresh && !expired) {
    return { source: 'local-cache', expired: false };
  }

  const endpoint = endpointOverride || getSchemaEndpoint();

  if (!endpoint) throw new Error('Schema endpoint missing');

  const raw = await fetchAllSchemas(endpoint);
  const normalized = normalizeAllSchemas(raw);
  console.log('🟢 🟢 🟢 🟢 🟢 schema:🟢 🟢 🟢 🟢 🟢 🟢 ', normalized);

  saveAllToCache(normalized);
  setLastUpdated(nowTimestamp());

  emit('schemas_updated', { source: 'api' });
  return { source: 'api', expired };
}

export async function refreshSchemas(options = {}) {
  return initSchemaEngine({ forceRefresh: true, ...options });
}

export const getSchema = (t) => getSchemaInternal(t);
export const getColumns = (t) => getColumnsInternal(t);
export const getObjectTemplate = (t) => getObjectTemplateInternal(t);
export const getFields = (t) => getFieldsInternal(t);

export const onSchemasUpdated = (h) => on('schemas_updated', h);
export const offSchemasUpdated = (h) => off('schemas_updated', h);

export const getAllSchemasInMemory = () => ({ ...memoryCache.schemas });
