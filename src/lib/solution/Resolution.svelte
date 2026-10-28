<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { analyze, type Report, type Tenant } from './analysis';
  const tenants = Object.values(import.meta.glob<Tenant>('/src/lib/data/tenants/*.json', { eager: true, import: 'default' }));
  const result = $derived(analyze(reports as Report[], tenants, notes.oneDayMove));
  let selected = $state('all');
  const shown = $derived(result.groups.filter(g => selected === 'all' || g.cause === selected));
  const maxWeek = $derived(Math.max(1, ...result.weeks.flatMap(w => [w.received, w.merged])));
</script>

<p class="summary"><strong>{result.total}</strong> unique reports are merged into #{result.ticket}: <strong>{result.groups.filter(g => g.count > 0).length}</strong> classified causes.</p>
<p>The export contains {result.exportRows} rows. Removing {result.duplicateRows} repeated ids leaves {result.uniqueRows} unique reports, of which {result.excludedRows} are outside this ticket. The last received timestamp is <code>{result.lastReceived}</code>.</p>

<label>Show cause <select aria-label="Show cause" bind:value={selected}><option value="all">All causes</option><option value="parser">Shared parser</option><option value="hint">booking-v3 hint</option></select></label>
<div class="table-scroll"><table>
  <thead><tr><th>Cause</th><th>Reports</th><th>Tenants</th><th>Intake disagrees</th><th>First → last received (declared offset)</th></tr></thead>
  <tbody>{#each shown as g (g.cause)}<tr><td>{g.cause}</td><td>{g.count}</td><td>{g.tenants.length}</td><td>{g.tagMismatches.length}</td><td>{g.firstSeen} → {g.lastSeen}</td></tr>{/each}</tbody>
</table></div>
<p>Classification follows tenant locale, booking-form version and report channel. It does not follow the reporter browser locale, subject or intake tag. Intake disagrees with the exported cause on {result.tagMismatches} reports.</p>

{#each shown as g (g.cause)}
  <h3>{g.cause === 'parser' ? 'The shared month-first parser' : 'The misleading booking-v3 date hint'}</h3>
  <p>{g.cause === 'parser' ? 'Day-first tenants reach a shared parser that assumes MM/DD. App/email reports and booking-v2 forms belong here, including app/email from booking-v3 tenants.' : 'A booking-v3 form tells users MM/DD/YYYY while interpreting input using the day-first tenant locale. Only the form channel follows this cause.'}</p>
  <p>Tenant handles: {g.tenants.join(', ')}. Intake tags: {Object.entries(g.intakeTags).map(([tag, n]) => `${tag}: ${n}`).join('; ')}.</p>
  {#each g.examples as r (r.id)}<details><summary>{r.id} · {r.tenant} · {r.channel}</summary><p>Received {r.receivedAt}; merged {r.mergedAt}. Intake tag: {r.meta.intakeTag}; browser locale: {r.meta.browserLocale}.</p><blockquote>{r.body}</blockquote></details>{/each}
{/each}

<h2>Received is not merged</h2>
<p>The earliest merge day is {result.firstMergeDay.date}: {result.firstMergeDay.merged} reports were merged then, and {result.firstMergeDay.olderReports} had been received earlier. A merge spike is a desk action; it does not prove a new outbreak on that date. Reports continue through {result.lastReceived.slice(0, 10)}.</p>
<figure>
  <svg viewBox="0 0 720 160" role="img" aria-label="Reports received and merged per week; received in orange, merged in green">
    {#each result.weeks as w, i (w.week)}
      <rect fill="#b4501f" x={i * 720 / result.weeks.length + 2} y={125 - w.received / maxWeek * 110} width="8" height={w.received / maxWeek * 110}><title>{w.week}: {w.received} received</title></rect>
      <rect fill="#2f6f5e" x={i * 720 / result.weeks.length + 11} y={125 - w.merged / maxWeek * 110} width="8" height={w.merged / maxWeek * 110}><title>{w.week}: {w.merged} merged</title></rect>
      {#if i % 4 === 0}<text x={i * 720 / result.weeks.length + 2} y="147">{w.week.slice(5)}</text>{/if}
    {/each}
  </svg><figcaption>Received (orange) and merged (green), Monday–Sunday weeks by each source timestamp's declared calendar date. Timezones are not silently converted.</figcaption>
</figure>
<details><summary>Open the weekly counts</summary><table><thead><tr><th>Week</th><th>Received</th><th>Merged</th></tr></thead><tbody>{#each result.weeks as w (w.week)}<tr><td>{w.week}</td><td>{w.received}</td><td>{w.merged}</td></tr>{/each}</tbody></table></details>

<h2>Timing notes need follow-up</h2>
<p>The desk marked {result.oneDayNotes.length} reports as one-day/timing discrepancies. The exported cause logic places all of these under parser. Their descriptions do not establish a month/day swap, and the code assignment does not settle the cause. They remain counted and visible here; timezone, DST or another mechanism is unconfirmed.</p>
{#each result.oneDayNotes as r (r.id)}<details><summary>{r.id} · {r.tenant}</summary><p>Received {r.receivedAt}; channel {r.channel}.</p><blockquote>{r.body}</blockquote></details>{/each}

<style>
  .summary { font-size: 1.2rem; } select { margin: 0 0.5rem; padding: 0.3rem; } .table-scroll { overflow-x: auto; }
  details { border-bottom: 1px solid var(--line); padding: 0.6rem 0; } summary { cursor: pointer; font-weight: 600; }
  blockquote { border-left: 3px solid var(--accent); margin: 1rem 0; padding-left: 1rem; }
  svg { width: 100%; } text { font: 10px system-ui; fill: var(--muted); } figcaption { color: var(--muted); font-size: 0.85rem; } figure { margin: 1rem 0; }
</style>
