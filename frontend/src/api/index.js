import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

export const fetchData    = ()  => API.get('/data').then(r => r.data);
export const detectIssues = ()  => API.get('/detect').then(r => r.data);
export const fixAll       = ()  => API.post('/action/all').then(r => r.data);
export const fetchLogs    = ()  => API.get('/logs').then(r => r.data);
export const resetLogs    = ()  => API.delete('/logs/reset').then(r => r.data);
export const fixOne       = (payload) => API.post('/action', payload).then(r => r.data);

export const toggleRealtime = (enabled) => API.post(`/realtime/toggle?enabled=${enabled}`).then(r => r.data);
export const getRealtimeStatus = () => API.get('/realtime/status').then(r => r.data);

// ─── New AI Feature APIs ──────────────────────────────────────
export const aiChat        = (message) => API.post('/ai/chat', { message }).then(r => r.data);
export const runPipeline   = ()        => API.get('/pipeline/run').then(r => r.data);
export const getForecast   = ()        => API.get('/forecast').then(r => r.data);
export const approveAction = (payload) => API.post('/workflow/approve', payload).then(r => r.data);
export const rejectAction  = (payload) => API.post('/workflow/reject', payload).then(r => r.data);
