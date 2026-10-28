import type { Cause, Analysis } from './analysis.js';

export const titles: Record<Cause, string> = {
  parser: 'Shared date parser reads day-first tenant dates as MM/DD',
  hint: 'booking-v3 shows MM/DD/YYYY while the tenant form reads day-first dates',
};
const descriptions: Record<Cause, string> = {
  parser: 'The shared parser assumes month-first input for a day-first tenant. This applies to app/email and booking-v2 form reports. An app report from a booking-v3 tenant still follows this parser path.',
  hint: 'The booking-v3 form prints MM/DD/YYYY, but parses input using the day-first tenant locale. Only the form channel with booking-v3 follows this path. Changing the shared parser alone does not repair this misleading hint.',
};
export function issueBody(result: Analysis, cause: Cause): string {
  const g = result.groups.find(g => g.cause === cause)!;
  return `This issue covers **${g.count} unique reports** from support ticket #${result.ticket}, across ${g.tenants.length} tenants. It is a local draft; the export is a snapshot through ${result.lastReceived.slice(0, 10)}, not a current desk count.\n\n` +
    `${descriptions[cause]}\n\n` +
    `The count is computed from reports-4471.json after deduplication by report id, using tenant locale and form from tenants/*.json and the channel rule in causes.ts. Browser locale, intake tag and subject are not cause classifiers.\n\n` +
    `Intake disagrees on ${g.tagMismatches.length} reports in this group. ${g.oneDayNotes.length} desk notes describe a one-day move or timing discrepancy; they remain counted under this exported cause, with their text preserved as unresolved evidence. A timezone/DST cause is not established by this export.\n\n` +
    `Evidence:\n\n${g.examples.map(r => `${r.id} (${r.tenant}, ${r.channel}, received ${r.receivedAt}):\n\n> ${r.body}`).join('\n\n')}\n\n` +
    (cause === 'parser' ? 'Reproduce with a day-first tenant through app/email or booking-v2: input 07/04/2026 must mean 7 April, and must not become 4 July. Test the parser with both ambiguous and unambiguous dates and validate generated invites.\n\n' : 'Reproduce through booking-v3 for a day-first tenant: the MM/DD/YYYY hint directs users to enter 04/07/2026 for 7 April, while the form interprets it as 4 July. Align hint and parsing; test booking-v2 and app/email separately.\n\n') +
    `Done means the affected path is fixed, regression checks pass, and the desk verifies sample reports. No production fix has been applied.\n\nAll report ids are in evidence/${cause}-report-ids.json. The computed page is /kb/incidents/4471-review/. Related analysis covers ${result.total} reports as separate parser and hint problems; the old subject-only merge rule must not be used to combine them again.\n`;
}

