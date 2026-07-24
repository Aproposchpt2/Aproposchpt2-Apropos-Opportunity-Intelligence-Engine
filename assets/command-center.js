const CONFIG = {
  supabaseUrl: window.AP_COMMAND_CONFIG?.supabaseUrl || 'https://judislfknmhofcgzyozc.supabase.co',
  anonKey: window.AP_COMMAND_CONFIG?.anonKey || '',
  refreshMs: 15000,
  maxPublishers: 5
};

const AGENTS = [
  ['Acquisition Operations', 'Discovers jobs, executes approved connectors, and records normalized acquisition evidence.'],
  ['Procurement Intelligence Processing', 'Registers documents, executes PIEE, extracts requirements, and builds Contract DNA.'],
  ['Eligibility and Matching', 'Applies lifecycle and hard constraints, AOIE matching, evidence, confidence, and fit scores.'],
  ['Delivery', 'Publishes approved procurement intelligence and removes invalid lifecycle records.'],
  ['Executive Reporting', 'Aggregates results, health, history, and the Daily Executive Intelligence Brief.']
];

const PROVIDERS = {
  openai: { name: 'OpenAI', status: 'Available', health: 'healthy' },
  anthropic: { name: 'Anthropic', status: 'Available when configured', health: 'healthy' },
  manual: { name: 'Manual Acquisition', status: 'Operator controlled', health: 'manual_review' }
};

const FALLBACK_PUBLISHERS = [
  { id:'AZ-T1-001', name:'Arizona Procurement Portal', platform:'APP', vendor:'State of Arizona', connector_status:'Healthy' },
  { id:'AZ-T1-002', name:'Arizona Department of Transportation', platform:'ADOT / Bid Express', vendor:'Bid Express', connector_status:'Healthy' },
  { id:'AZ-T1-003', name:'Arizona State University', platform:'ASU Procurement', vendor:'Arizona State University', connector_status:'Healthy' },
  { id:'AZ-T1-004', name:'University of Arizona', platform:'UArizona Procurement', vendor:'University of Arizona', connector_status:'Healthy' },
  { id:'AZ-L1-001', name:'Maricopa County', platform:'County Procurement Portal', vendor:'Maricopa County', connector_status:'Healthy' },
  { id:'AZ-L1-002', name:'City of Phoenix', platform:'Procurement Services', vendor:'City of Phoenix', connector_status:'Healthy' }
];

const state = {
  token:null, run:null, jobs:[], metrics:{}, failures:[], history:[], brief:null, timer:null,
  provider:'', publishers:[], publisherRegistry:[...FALLBACK_PUBLISHERS], publisherRuns:[], acquisitionEvents:[], manualIntervention:null
};
const $ = id => document.getElementById(id);

function apiHeaders() {
  const headers = { 'Content-Type':'application/json', apikey:CONFIG.anonKey };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  return headers;
}

async function invoke(name, payload = {}) {
  if (!CONFIG.anonKey) throw new Error('Command Center configuration is incomplete. Set window.AP_COMMAND_CONFIG.anonKey.');
  const response = await fetch(`${CONFIG.supabaseUrl}/functions/v1/${name}`, { method:'POST', headers:apiHeaders(), body:JSON.stringify(payload) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || `${name} failed (${response.status})`);
  return data;
}

function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function formatDate(value) { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.valueOf()) ? '—' : date.toLocaleString(); }
function duration(start, end = new Date().toISOString()) {
  if (!start) return '—';
  const milliseconds = Math.max(0, new Date(end) - new Date(start));
  const seconds = Math.floor(milliseconds / 1000), minutes = Math.floor(seconds / 60), hours = Math.floor(minutes / 60);
  return hours ? `${String(hours).padStart(2,'0')}:${String(minutes % 60).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}` : `${String(minutes).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;
}
function normalizeStatus(value = 'queued') { return String(value).trim().toLowerCase().replaceAll(' ','_'); }
function publisherId(item = {}) { return item.publisher_id || item.id || item.publisherId || ''; }
function publisherName(item = {}) { return item.publisher_name || item.name || item.publisherName || publisherId(item) || 'Unknown Publisher'; }
function registryPublisher(id) { return state.publisherRegistry.find(item => publisherId(item) === id); }
function number(value) { return Number(value || 0).toLocaleString(); }

function setStatus(status = 'idle') {
  const normalized = normalizeStatus(status);
  const node = $('systemStatus');
  node.textContent = normalized.replaceAll('_',' ').toUpperCase();
  node.className = `status-pill status-${normalized}`;
}

function renderProvider() {
  $('providerSelect').value = state.provider;
  const provider = PROVIDERS[state.provider];
  const healthOverride = state.metrics?.provider_health?.[state.provider] || state.metrics?.provider_health;
  const health = normalizeStatus(healthOverride || provider?.health || 'idle');
  $('providerHealthBadge').textContent = provider ? health.replaceAll('_',' ').toUpperCase() : 'NOT SELECTED';
  $('providerHealthBadge').className = `status-pill status-${provider ? health : 'idle'}`;
  $('providerStatusText').textContent = provider ? `${provider.name} · ${provider.status} · Health: ${health.replaceAll('_',' ')}` : 'Select a provider to display status and health.';
}

function filteredPublishers() {
  const query = $('publisherSearch').value.trim().toLowerCase();
  return state.publisherRegistry.filter(item => !query || [publisherId(item),publisherName(item),item.platform,item.technology_platform,item.vendor,item.technology_vendor,item.connector_status].some(value => String(value || '').toLowerCase().includes(query)));
}

function renderPublisherSelector() {
  const options = filteredPublishers();
  $('publisherSelect').innerHTML = options.length ? options.map(item => {
    const id = publisherId(item), platform = item.platform || item.technology_platform || 'Unknown platform', vendor = item.vendor || item.technology_vendor || 'Unknown vendor', status = item.connector_status || item.status || 'Unknown';
    return `<option value="${escapeHtml(id)}">${escapeHtml(id)} — ${escapeHtml(publisherName(item))} | ${escapeHtml(platform)} | ${escapeHtml(vendor)} | ${escapeHtml(status)}</option>`;
  }).join('') : '<option value="">No publishers found</option>';
}

function renderPublisherQueue() {
  $('publisherCount').textContent = `${state.publishers.length} / ${CONFIG.maxPublishers}`;
  $('publisherQueue').innerHTML = state.publishers.length ? state.publishers.map(id => {
    const item = registryPublisher(id) || { id, name:id };
    return `<li data-publisher-id="${escapeHtml(id)}"><span class="queue-item-main"><strong>${escapeHtml(publisherName(item))}</strong><small>${escapeHtml(id)} · ${escapeHtml(item.platform || item.technology_platform || 'Platform unknown')} · ${escapeHtml(item.connector_status || item.status || 'Status unknown')}</small></span></li>`;
  }).join('') : '<li class="empty-state">No publishers selected.</li>';
  $('addPublisherButton').disabled = state.publishers.length >= CONFIG.maxPublishers;
  $('removePublisherButton').disabled = state.publishers.length === 0;
}

function renderAgents() {
  const jobByAgent = Object.fromEntries(state.jobs.map(job => [job.agent_name,job]));
  $('agentGrid').innerHTML = AGENTS.map(([name,description],index) => {
    const job = jobByAgent[name] || jobByAgent[`agent-${index + 1}`] || {};
    const status = normalizeStatus(job.status || 'pending');
    return `<article class="agent-card ${escapeHtml(status)}"><div><span class="number">AGENT ${index + 1}</span><h3>${escapeHtml(name)}</h3><p>${escapeHtml(description)}</p></div><span class="agent-state">${escapeHtml(status)}${job.attempt_count ? ` · attempt ${job.attempt_count}` : ''}</span></article>`;
  }).join('');
}

function metric(key) { return number(state.metrics?.[key]); }
function renderMetrics() {
  const bindings = { publishersProcessed:'publishers_processed',opportunitiesDiscovered:'opportunities_discovered',opportunitiesInserted:'opportunities_inserted',opportunitiesUpdated:'opportunities_updated',documentsProcessed:'documents_processed',contractDnaCompleted:'contract_dna_completed',eligibleOpportunities:'eligible_opportunities',publishedOpportunities:'published_opportunities',runningJobs:'running_jobs',completedJobs:'completed_jobs',failedJobs:'failed_jobs',retryCount:'retry_count',queueDepth:'queue_depth' };
  Object.entries(bindings).forEach(([id,key]) => $(id).textContent = metric(key));
  $('processingTime').textContent = state.metrics.processing_time || duration(state.run?.started_at,state.run?.completed_at);
  $('connectorHealth').textContent = state.metrics.connector_health || 'Unknown';
}

function publisherRunStatus(run) { return normalizeStatus(run.status || run.publisher_status || 'queued'); }
function completedRuns() { return state.publisherRuns.filter(run => publisherRunStatus(run) === 'completed'); }
function failedRuns() { return state.publisherRuns.filter(run => publisherRunStatus(run) === 'failed'); }
function manualRuns() { return state.publisherRuns.filter(run => ['manual_intervention_required','manual_review'].includes(publisherRunStatus(run))); }
function activePublisherRun() { return state.publisherRuns.find(run => ['initializing','connecting','acquiring','normalizing','validating','running'].includes(publisherRunStatus(run))); }

function renderRun() {
  const run = state.run;
  setStatus(run?.status || state.metrics.system_status || 'operational');
  $('currentStage').textContent = (run?.current_stage || 'IDLE').replaceAll('_',' ').toUpperCase();
  $('runIdentifier').textContent = run?.id ? `Run ${run.id.slice(0,8)}` : 'No active run';
  $('executionState').textContent = run?.status || 'Idle';
  $('runStarted').textContent = formatDate(run?.started_at);
  $('runCompleted').textContent = formatDate(run?.completed_at);
  $('runRuntime').textContent = duration(run?.started_at,run?.completed_at);
  $('totalRuntime').textContent = state.metrics.total_runtime || duration(run?.started_at,run?.completed_at);

  const total = state.publisherRuns.length || state.publishers.length;
  const completed = completedRuns().length;
  const failed = failedRuns().length;
  const manual = manualRuns().length;
  const active = activePublisherRun();
  const remaining = Math.max(0,total - completed - failed - manual);
  const successRate = total ? `${Math.round((completed / total) * 100)}%` : '—';

  $('currentProvider').textContent = PROVIDERS[run?.provider || state.provider]?.name || run?.provider || '—';
  $('currentPublisher').textContent = active ? publisherName(active) : (run?.current_publisher_name || run?.current_publisher || '—');
  $('remainingPublishers').textContent = number(remaining);
  $('completedPublishers').textContent = number(completed);
  $('failedPublishers').textContent = number(failed);
  $('manualReviewCount').textContent = number(manual);
  $('publisherSuccessRate').textContent = state.metrics.publisher_success_rate || successRate;
  $('acquisitionHealth').textContent = state.metrics.acquisition_health || (failed ? 'Degraded' : active ? 'Running' : completed ? 'Healthy' : 'Unknown');
  $('overallSystemHealth').textContent = state.metrics.overall_system_health || state.metrics.system_status || run?.status || 'Unknown';
  $('progressBar').style.width = `${total ? Math.min(100,(completed / total) * 100) : 0}%`;
  $('progressText').textContent = `${completed} of ${total} publishers completed`;

  const runActive = ['running','retrying','stopping'].includes(run?.status);
  const configReady = Boolean(state.provider && state.publishers.length);
  $('beginButton').disabled = runActive || !configReady;
  $('resumeButton').disabled = !run || !['failed','interrupted','stopped','completed_with_failures'].includes(run.status);
  $('stopButton').disabled = !runActive;
}

function renderPublisherStatuses() {
  $('publisherStatusList').innerHTML = state.publisherRuns.length ? state.publisherRuns.map(run => {
    const status = publisherRunStatus(run);
    return `<div class="publisher-status-item"><div><strong>${escapeHtml(publisherName(run))}</strong><small>${escapeHtml(publisherId(run))} · ${escapeHtml(run.current_step || run.stage || 'Awaiting stage information')}</small></div><span class="publisher-state status-${escapeHtml(status)}">${escapeHtml(status.replaceAll('_',' '))}</span></div>`;
  }).join('') : '<p>No publisher batch is active.</p>';
}

function renderCompletedRuns() {
  const runs = completedRuns();
  $('completedPublisherRuns').innerHTML = runs.length ? runs.map(run => `<article class="completed-run"><header><div><h3>✓ ${escapeHtml(publisherName(run))}</h3><small>${escapeHtml(publisherId(run))}</small></div><span class="publisher-state status-completed">Completed</span></header><dl><div><dt>Runtime</dt><dd>${escapeHtml(run.runtime || duration(run.started_at,run.completed_at))}</dd></div><div><dt>Records Discovered</dt><dd>${number(run.records_discovered || run.opportunities_discovered)}</dd></div><div><dt>Records Inserted</dt><dd>${number(run.records_inserted || run.opportunities_inserted)}</dd></div><div><dt>Records Updated</dt><dd>${number(run.records_updated || run.opportunities_updated)}</dd></div><div><dt>Documents Registered</dt><dd>${number(run.documents_registered)}</dd></div><div><dt>PIEE Documents Processed</dt><dd>${number(run.piee_documents_processed || run.documents_processed)}</dd></div><div><dt>Contract DNA Completed</dt><dd>${number(run.contract_dna_completed)}</dd></div><div><dt>Status</dt><dd>${escapeHtml(run.status || 'Completed')}</dd></div></dl></article>`).join('') : '<p>No completed publisher runs available.</p>';
}

function renderAcquisitionFeed() {
  const events = [...state.acquisitionEvents].sort((a,b) => new Date(b.created_at || b.timestamp || 0) - new Date(a.created_at || a.timestamp || 0));
  $('acquisitionFeed').innerHTML = events.length ? events.map(event => {
    const timestamp = event.created_at || event.timestamp;
    const time = timestamp ? new Date(timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '—';
    return `<div class="feed-item"><time>${escapeHtml(time)}</time><div><strong>${escapeHtml(event.message || event.event_message || event.event_type || 'Acquisition event')}</strong>${event.publisher_name || event.publisher_id ? `<small>${escapeHtml(event.publisher_name || event.publisher_id)}</small>` : ''}</div></div>`;
  }).join('') : '<p>No acquisition events recorded.</p>';
}

function renderManualIntervention() {
  const item = state.manualIntervention || manualRuns()[0];
  $('manualInterventionPanel').hidden = !item;
  if (!item) return;
  const name = publisherName(item);
  $('manualPublisherName').textContent = name;
  $('manualPublisher').textContent = `${publisherId(item)} · ${name}`;
  $('manualStep').textContent = item.current_step || item.stage || 'Unknown';
  $('manualReason').textContent = item.reason || item.error_message || item.message || 'No reason supplied.';
  $('manualAction').textContent = item.recommended_action || 'Review the connector evidence and resolve the blocking condition.';
  $('manualResumePoint').textContent = item.resume_point || item.current_step || item.stage || 'Failed stage';
  $('resumePublisherButton').dataset.publisherId = publisherId(item);
  $('resumePublisherButton').dataset.resumePoint = item.resume_point || item.current_step || item.stage || '';
}

function renderHistory() { $('historyBody').innerHTML = state.history.length ? state.history.map(run => `<tr><td>${escapeHtml(run.id?.slice(0,8) || '—')}</td><td>${escapeHtml(run.status || '—')}</td><td>${escapeHtml(run.current_stage || '—')}</td><td>${escapeHtml(formatDate(run.started_at))}</td></tr>`).join('') : '<tr><td colspan="4">No execution history available.</td></tr>'; }
function renderFailures() { $('failureLog').innerHTML = state.failures.length ? state.failures.map(item => `<div class="failure-item"><strong>${escapeHtml(item.agent_name || item.publisher_name || item.failure_type || 'Operational failure')}</strong><span>${escapeHtml(item.message || item.error_message || 'No message')} · ${escapeHtml(formatDate(item.created_at))}</span></div>`).join('') : '<p>No failures recorded.</p>'; }
function renderBrief() {
  const brief = state.brief; if (!brief) return;
  const sections = brief.content || brief.brief || brief;
  if (typeof sections === 'string') { $('executiveBrief').innerHTML = `<p>${escapeHtml(sections)}</p>`; return; }
  $('executiveBrief').innerHTML = Object.entries(sections).map(([heading,value]) => `<h3>${escapeHtml(heading.replaceAll('_',' '))}</h3><p>${escapeHtml(typeof value === 'object' ? JSON.stringify(value,null,2) : value)}</p>`).join('');
}

function render() {
  renderProvider(); renderPublisherSelector(); renderPublisherQueue(); renderRun(); renderAgents(); renderPublisherStatuses(); renderCompletedRuns(); renderAcquisitionFeed(); renderManualIntervention(); renderMetrics(); renderHistory(); renderFailures(); renderBrief();
  $('lastRefresh').textContent = `Updated ${new Date().toLocaleTimeString()}`;
}

async function refreshStatus(showMessage = false) {
  try {
    const data = await invoke('command-status', {});
    state.run = data.run || null;
    state.jobs = data.jobs || [];
    state.metrics = data.metrics || {};
    state.failures = data.failures || [];
    state.history = data.history || [];
    state.publisherRegistry = data.publisher_registry || data.publishers || state.publisherRegistry;
    state.publisherRuns = data.publisher_runs || data.acquisition?.publisher_runs || [];
    state.acquisitionEvents = data.acquisition_events || data.events || data.acquisition?.events || [];
    state.manualIntervention = data.manual_intervention || data.acquisition?.manual_intervention || null;
    if (!state.provider && data.run?.provider) state.provider = data.run.provider;
    if (!state.publishers.length && Array.isArray(data.run?.publishers)) state.publishers = data.run.publishers.map(item => typeof item === 'string' ? item : publisherId(item)).filter(Boolean).slice(0,CONFIG.maxPublishers);
    render();
    if (showMessage) $('commandMessage').textContent = 'Status refreshed.';
  } catch (error) { setStatus('failed'); $('commandMessage').textContent = error.message; }
}

async function command(name,message,payload = {}) {
  $('commandMessage').textContent = message;
  try { await invoke(name,{ ...(state.run?.id ? { run_id:state.run.id } : {}), ...payload }); await refreshStatus(); }
  catch (error) { $('commandMessage').textContent = error.message; }
}

$('providerSelect').addEventListener('change', event => { state.provider = event.target.value; renderProvider(); renderRun(); });
$('publisherSearch').addEventListener('input', renderPublisherSelector);
$('addPublisherButton').addEventListener('click', () => {
  const id = $('publisherSelect').value;
  if (!id) return;
  if (state.publishers.includes(id)) { $('commandMessage').textContent = 'That publisher is already in the queue.'; return; }
  if (state.publishers.length >= CONFIG.maxPublishers) { $('commandMessage').textContent = 'A maximum of five publishers may be selected.'; return; }
  state.publishers.push(id); renderPublisherQueue(); renderRun(); $('commandMessage').textContent = `${publisherName(registryPublisher(id))} added to the acquisition queue.`;
});
$('removePublisherButton').addEventListener('click', () => {
  if (!state.publishers.length) return;
  const removed = state.publishers.pop(); renderPublisherQueue(); renderRun(); $('commandMessage').textContent = `${publisherName(registryPublisher(removed))} removed from the acquisition queue.`;
});
$('publisherQueue').addEventListener('click', event => {
  const item = event.target.closest('[data-publisher-id]');
  if (!item) return;
  const id = item.dataset.publisherId;
  state.publishers = state.publishers.filter(value => value !== id); renderPublisherQueue(); renderRun();
});
$('beginButton').addEventListener('click', () => {
  if (!state.provider || !state.publishers.length) { $('commandMessage').textContent = 'Select a provider and at least one publisher.'; return; }
  command('command-begin-daily-operations','Creating publisher batch and starting Acquisition Operations…',{ provider:state.provider, publishers:state.publishers, acquisition_config:{ provider:state.provider, publisher_ids:state.publishers, max_publishers:CONFIG.maxPublishers } });
});
$('resumeButton').addEventListener('click', () => command('command-resume','Resuming from the first unresolved stage…'));
$('stopButton').addEventListener('click', () => command('command-stop','Requesting a governed stop…'));
$('refreshButton').addEventListener('click', () => refreshStatus(true));
$('resumePublisherButton').addEventListener('click', event => command('command-resume','Resuming publisher from the recorded failed stage…',{ publisher_id:event.currentTarget.dataset.publisherId, resume_from:event.currentTarget.dataset.resumePoint, resume_scope:'publisher' }));
$('briefButton').addEventListener('click', async () => {
  try { const data = await invoke('command-executive-brief',state.run?.id ? { run_id:state.run.id } : {}); state.brief = data.brief || data; renderBrief(); }
  catch (error) { $('executiveBrief').innerHTML = `<p>${escapeHtml(error.message)}</p>`; }
});

renderAgents(); render(); refreshStatus(); state.timer = window.setInterval(refreshStatus,CONFIG.refreshMs);