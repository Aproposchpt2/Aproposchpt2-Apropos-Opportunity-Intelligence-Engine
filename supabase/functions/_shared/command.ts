export const AGENT_SEQUENCE = [
  { sequence: 1, name: 'Acquisition Operations', functionName: 'agent-acquisition' },
  { sequence: 2, name: 'Procurement Intelligence Processing', functionName: 'agent-intelligence-processing' },
  { sequence: 3, name: 'Eligibility and Matching', functionName: 'agent-eligibility-matching' },
  { sequence: 4, name: 'Delivery', functionName: 'agent-delivery' },
  { sequence: 5, name: 'Executive Reporting', functionName: 'agent-executive-reporting' }
] as const;

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

export function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function serviceClient() {
  return {
    url: requireEnv('SUPABASE_URL'),
    key: requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  };
}

export async function db(path: string, init: RequestInit = {}) {
  const { url, key } = serviceClient();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || data?.hint || `Database request failed (${response.status})`);
  return data;
}

export async function invoke(functionName: string, payload: unknown) {
  const { url, key } = serviceClient();
  const response = await fetch(`${url}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `${functionName} failed (${response.status})`);
  return data;
}

export async function recordEvent(runId: string, jobId: string | null, eventType: string, message: string, evidence: unknown = {}) {
  await db('command_events', { method: 'POST', body: JSON.stringify({ run_id: runId, job_id: jobId, event_type: eventType, message, evidence }) });
}

export async function recordMetrics(runId: string, jobId: string | null, metrics: Record<string, number | string>) {
  const rows = Object.entries(metrics).map(([metric_name, value]) => ({
    run_id: runId, job_id: jobId, metric_name,
    metric_value: typeof value === 'number' ? value : null,
    metric_text: typeof value === 'string' ? value : null
  }));
  if (rows.length) await db('command_metrics', { method: 'POST', body: JSON.stringify(rows) });
}

export async function parseBody(request: Request) {
  if (request.method === 'OPTIONS') return null;
  return await request.json().catch(() => ({}));
}
