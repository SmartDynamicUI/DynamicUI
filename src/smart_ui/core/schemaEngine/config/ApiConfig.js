export function getSchemaEndpoint() {
  // CRA (npm start)
  if (typeof process !== 'undefined' && process.env.REACT_APP_SCHEMA_ENDPOINT) {
    return process.env.REACT_APP_SCHEMA_ENDPOINT;
  }
  // Vite (npm run dev)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SCHEMA_ENDPOINT) {
    return import.meta.env.VITE_SCHEMA_ENDPOINT;
  }

  // Node (اختياري)
  if (typeof process !== 'undefined' && process.env.SCHEMA_ENDPOINT) {
    return process.env.SCHEMA_ENDPOINT;
  }

  return null;
}
