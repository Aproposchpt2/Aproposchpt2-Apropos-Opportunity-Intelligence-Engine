const CONFIG = {
  supabaseUrl: window.AP_COMMAND_CONFIG?.supabaseUrl || 'https://judislfknmhofcgzyozc.supabase.co',
  anonKey: window.AP_COMMAND_CONFIG?.anonKey || '',
  refreshMs: 15000
};

const AGENTS = [
  ['Acquisition Operations', 'Discovers jobs, executes approved connectors, and records normalized acquisition evidence.'],
  ['Procurement Intelligence Processing', 'Registers documents, executes PIEE, extracts requirements, and builds Contract DNA.'],
  ['Eligibility and Matching', 'Applies lifecycle and hard constraints, AOIE matching, evidence, confidence, and fit scores.'],
  ['Delivery', 'Publishes approved procurement intelligence and removes invalid lifecycle records.'],
  ['Executive Reporting', 'Aggregates results, health, history, and the Daily Executive Intelligence Brief.']
];

const state = { token: null, run: null, jobs: [], metrics: {}, failures: [], history: [], brief: null, timer: null };
const $ = id => document.getElementById(id);

function apiHeaders() {
  const headers = { 'Content-Type': 'application/json', apikey: CONFIG.anonKey };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  return headers;
}

async function invoke(name, payload = {}) {
  if (!CONFIG.anonKey) throw new Error('Command Center configuration is incomplete. Set window.AP_COMMAND_CONFIG.anonKey.');
  const response = await fetch(`${CONFIG.supabaseUrl}/functions/v1/${name}`, {
    method: 'POST', headers: apiHeaders(), body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || `${name} failed (${response.status})`);
  return data;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '—' : date.toLocaleString();
}

function duration(start, end = new Date().toISOString()) {
  if (!start) return '—';
  const milliseconds = Math.max(0, new Date(end) - new Date(start));
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours) return `${hours}h ${minutes % 60}m`;
  if (minutes) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function setStatus(status = 'idle') {
  const normalized = String(status).toLowerCase().replaceAll(' ', '_');
  const node = $('systemStatus');
  node.textContent = normalized.replaceAll('_', ' ').toUpperCase();
  node.className = `status-pill status-${normalized}`;
}

function renderAgents() {
  const jobByAgent = Object.fromEntries(state.jobs.map(job => [job.agent_name, job]));
  $('agentGrid').innerHTML = AGENTS.map(([name, description], index) => {
    const job = jobByAgent[name] || jobByAgent[`agent-${index + 1}`] || {};
    const status = (job.status || 'pending').toLowerCase();
    return `<article class="agent-card ${escapeHtml(status)}">
      <div><span class="number">AGENT ${index + 1}</span><h3>${escapeHtml(name)}</h3><p>${escapeHtml(description)}</p></div>
      <span class="agent-state">${escapeHtml(status)}${job.attempt_count ? ` · attempt ${job.attempt_count}` : ''}</span>
    </article>`;
  }).join('');
}

function metric(key) { return Number(state.metrics?.[key] || 0).toLocaleString(); }
function renderMetrics() {
  const bindings = {
    publishersProcessed:'publishers_processed', opportunitiesDiscovered:'opportunities_discovered', opportunitiesInserted:'opportunities_inserted',
    opportunitiesUpdated:'opportunities_updated', documentsProcessed:'documents_processed', contractDnaCompleted:'contract_dna_completed',
    eligibleOpportunities:'eligible_opportunities', publishedOpportunities:'published_opportunities', runningJobs:'running_jobs',
    completedJobs:'completed_jobs', failedJobs:'failed_jobs', retryCount:'retry_count', queueDepth:'queue_depth'
  };
  Object.entries(bindings).forEach(([id,key]) => $(id).textContent = metric(key));
  $('processingTime').textContent = state.metrics.processing_time || duration(state.run?.started_at, state.run?.completed_at);
  $('connectorHealth').textContent = state.metrics.connector_health || 'Unknown';
}

function renderRun() {
  const run = state.run;
  setStatus(run?.status || state.metrics.system_status || 'operational');
  $('currentStage').textContent = (run?.current_stage || 'IDLE').replaceAll('_',' ').toUpperCase();
  $('runIdentifier').textContent = run?.id ? `Run ${run.id.slice(0, 8)}` : 'No active run';
  $('executionState').textContent = run?.status || 'Idle';
  $('runStarted').textContent = formatDate(run?.started_at);
  $('runCompleted').textContent = formatDate(run?.completed_at);
  $('runRuntime').textContent = duration(run?.started_at, run?.completed_at);
  const completed = state.jobs.filter(job => job.status === 'completed').length;
  $('progressBar').style.width = `${Math.min(100, completed / 5 * 100)}%`;
  $('progressText').textContent = `${completed} of 5 agents completed`;
  const active = ['running','retrying','stopping'].includes(run?.status);
  $('beginButton').disabled = active;
  $('resumeButton').disabled = !run || !['failed','interrupted','stopped','completed_with_failures'].includes(run.status);
  $('stopButton').disabled = !active;
}

function renderHistory() {
  $('historyBody').innerHTML = state.history.length ? state.history.map(run => `<tr><td>${escapeHtml(run.id?.slice(0,8) || '—')}</td><td>${escapeHtml(run.status || '—')}</td><td>${escapeHtml(run.current_stage || '—')}</td><td>${escapeHtml(formatDate(run.started_at))}</td></tr>`).join('') : '<tr><td colspan="4">No execution history available.</td></tr>';
}

function renderFailures() {
  $('failureLog').innerHTML = state.failures.length ? state.failures.map(item => `<div class="failure-item"><strong>${escapeHtml(item.agent_name || item.failure_type || 'Operational failure')}</strong><span>${escapeHtml(item.message || item.error_message || 'No message')} · ${escapeHtml(formatDate(item.created_at))}</span></div>`).join('') : '<p>No failures recorded.</p>';
}

function renderBrief() {
  const brief = state.brief;
  if (!brief) return;
  const sections = brief.content || brief.brief || brief;
  if (typeof sections === 'string') { $('executiveBrief').innerHTML = `<p>${escapeHtml(sections)}</p>`; return; }
  $('executiveBrief').innerHTML = Object.entries(sections).map(([heading, value]) => `<h3>${escapeHtml(heading.replaceAll('_',' '))}</h3><p>${escapeHtml(typeof value === 'object' ? JSON.stringify(value, null, 2) : value)}</p>`).join('');
}

function render() { renderRun(); renderAgents(); renderMetrics(); renderHistory(); renderFailures(); renderBrief(); $('lastRefresh').textContent = `Updated ${new Date().toLocaleTimeString()}`; }

async function refreshStatus(showMessage = false) {
  try {
    const data = await invoke('command-status', {});
    state.run = data.run || null; state.jobs = data.jobs || []; state.metrics = data.metrics || {}; state.failures = data.failures || []; state.history = data.history || [];
    render();
    if (showMessage) $('commandMessage').textContent = 'Status refreshed.';
  } catch (error) {
    setStatus('failed'); $('commandMessage').textContent = error.message;
  }
}

async function command(name, message) {
  $('commandMessage').textContent = message;
  try { await invoke(name, state.run?.id ? { run_id: state.run.id } : {}); await refreshStatus(); }
  catch (error) { $('commandMessage').textContent = error.message; }
}

$('beginButton').addEventListener('click', () => command('command-begin-daily-operations', 'Creating execution run and starting Agent 1…'));
$('resumeButton').addEventListener('click', () => command('command-resume', 'Resuming from the first unresolved stage…'));
$('stopButton').addEventListener('click', () => command('command-stop', 'Requesting a governed stop…'));
$('refreshButton').addEventListener('click', () => refreshStatus(true));
$('briefButton').addEventListener('click', async () => {
  try { const data = await invoke('command-executive-brief', state.run?.id ? { run_id: state.run.id } : {}); state.brief = data.brief || data; renderBrief(); }
  catch (error) { $('executiveBrief').innerHTML = `<p>${escapeHtml(error.message)}</p>`; }
});

renderAgents(); render(); refreshStatus(); state.timer = window.setInterval(refreshStatus, CONFIG.refreshMs);
