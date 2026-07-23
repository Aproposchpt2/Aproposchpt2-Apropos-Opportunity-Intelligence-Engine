import { corsHeaders, db, json } from '../_shared/command.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const runs = await db('command_runs?select=*&order=created_at.desc&limit=20');
    const run = runs[0] || null;
    const jobs = run ? await db(`command_jobs?run_id=eq.${run.id}&select=*&order=sequence_number.asc`) : [];
    const failures = run ? await db(`command_failures?run_id=eq.${run.id}&select=*&order=created_at.desc&limit=50`) : [];
    const rows = run ? await db(`command_metrics?run_id=eq.${run.id}&select=metric_name,metric_value,metric_text,recorded_at&order=recorded_at.desc`) : [];
    const metrics = {};
    for (const row of rows.reverse()) metrics[row.metric_name] = row.metric_value ?? row.metric_text;
    const status = (await db('system_status?singleton=eq.true&select=*'))[0] || {};
    metrics.system_status = status.operational_status;
    metrics.connector_health = status.connector_health?.overall || status.connector_health?.status || 'Unknown';
    metrics.running_jobs = jobs.filter((job) => ['running','retrying'].includes(job.status)).length;
    metrics.completed_jobs = jobs.filter((job) => job.status === 'completed').length;
    metrics.failed_jobs = jobs.filter((job) => job.status === 'failed').length;
    metrics.retry_count = jobs.reduce((sum, job) => sum + Math.max(0, (job.attempt_count || 0) - 1), 0);
    metrics.queue_depth = jobs.filter((job) => job.status === 'pending').length;
    return json({ run, jobs, metrics, failures, history: runs });
  } catch (error) { return json({ error: error.message }, 500); }
});
