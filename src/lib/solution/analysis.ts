/** Pure analysis shared by the CLI and the rendered KB. Intake tags are observations, not causes. */
export interface Report {
  id: string; receivedAt: string; tenant: string; channel: 'app' | 'email' | 'form';
  subject: string; body: string; meta: { browserLocale: string; intakeTag: string };
  mergedInto: number | null; mergedAt: string | null;
}
export interface Tenant { handle: string; name: string; locale: string; form: 'booking-v2' | 'booking-v3' }
export type Cause = 'parser' | 'hint';
export function dayFirst(locale: string): boolean {
  const parts = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date('2026-01-02T12:00:00Z')).map(p => p.type);
  return parts.indexOf('day') < parts.indexOf('month');
}
export function causeOf(report: Pick<Report, 'channel'>, tenant: Tenant | undefined): Cause | null {
  if (!tenant || !dayFirst(tenant.locale)) return null;
  return report.channel === 'form' && tenant.form === 'booking-v3' ? 'hint' : 'parser';
}
export function uniqueReports(rows: Report[]): Report[] {
  const result = new Map<string, Report>();
  for (const row of rows) {
    const previous = result.get(row.id);
    if (previous && JSON.stringify(previous) !== JSON.stringify(row))
      throw new Error(`Conflicting export rows for ${row.id}; obtain a consistent snapshot.`);
    result.set(row.id, row);
  }
  return [...result.values()];
}
export function analyze(rows: Report[], tenants: Tenant[], oneDayMove: string[], ticket = 4471) {
  const byTenant = new Map(tenants.map(t => [t.handle, t]));
  if (byTenant.size !== tenants.length) throw new Error('Duplicate tenant handle.');
  const unique = uniqueReports(rows);
  const reports = unique.filter(r => r.mergedInto === ticket);
  if (!reports.length) throw new Error(`No reports merged into #${ticket}.`);
  for (const r of reports) {
    if (!r.id || !r.subject || !r.body || !['app', 'email', 'form'].includes(r.channel) ||
        !Number.isFinite(Date.parse(r.receivedAt)) || !r.mergedAt || !Number.isFinite(Date.parse(r.mergedAt)) ||
        !r.meta || typeof r.meta.intakeTag !== 'string') throw new Error(`Incomplete report: ${r.id}.`);
    if (!causeOf(r, byTenant.get(r.tenant))) throw new Error(`Unplaced report ${r.id}: verify tenant and locale.`);
  }
  const groups = (['parser', 'hint'] as const).map(cause => {
    const members = reports.filter(r => causeOf(r, byTenant.get(r.tenant)) === cause);
    const received = members.map(r => r.receivedAt).sort((a, b) => Date.parse(a) - Date.parse(b));
    return { cause, count: members.length, tenants: [...new Set(members.map(r => r.tenant))].sort(),
      ids: members.map(r => r.id).sort(), firstSeen: received[0] ?? null, lastSeen: received.at(-1) ?? null,
      intakeTags: members.reduce<Record<string, number>>((acc, r) => { acc[r.meta.intakeTag] = (acc[r.meta.intakeTag] ?? 0) + 1; return acc; }, {}),
      tagMismatches: members.filter(r => r.meta.intakeTag !== cause).map(r => r.id),
      oneDayNotes: members.filter(r => oneDayMove.includes(r.id)), examples: members.slice(0, 3) };
  });
  const days = reports.flatMap(r => [r.receivedAt.slice(0, 10), r.mergedAt!.slice(0, 10)]).sort();
  const start = new Date(`${days[0]}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - (start.getUTCDay() + 6) % 7);
  const weekMs = 7 * 86_400_000;
  const weeks = Array.from({ length: Math.floor((Date.parse(days.at(-1)!) - +start) / weekMs) + 1 }, (_, i) => ({
    week: new Date(+start + i * weekMs).toISOString().slice(0, 10), received: 0, merged: 0 }));
  for (const r of reports) {
    weeks[Math.floor((Date.parse(r.receivedAt.slice(0, 10)) - +start) / weekMs)].received++;
    weeks[Math.floor((Date.parse(r.mergedAt!.slice(0, 10)) - +start) / weekMs)].merged++;
  }
  const dates = [...new Set(reports.map(r => r.mergedAt!.slice(0, 10)))].sort();
  const earliestMerge = dates[0];
  const firstMergeDay = reports.filter(r => r.mergedAt!.slice(0, 10) === earliestMerge);
  return { ticket, exportRows: rows.length, uniqueRows: unique.length, duplicateRows: rows.length - unique.length,
    total: reports.length, excludedRows: unique.length - reports.length, groups, weeks,
    firstMergeDay: { date: earliestMerge, merged: firstMergeDay.length,
      olderReports: firstMergeDay.filter(r => r.receivedAt.slice(0, 10) < earliestMerge).length },
    lastReceived: [...reports].sort((a, b) => Date.parse(a.receivedAt) - Date.parse(b.receivedAt)).at(-1)!.receivedAt,
    tagMismatches: groups.reduce((n, g) => n + g.tagMismatches.length, 0),
    oneDayNotes: reports.filter(r => oneDayMove.includes(r.id)),
    unusedNoteIds: oneDayMove.filter(id => !reports.some(r => r.id === id)) };
}
export type Analysis = ReturnType<typeof analyze>;
