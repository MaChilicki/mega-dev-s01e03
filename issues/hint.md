# booking-v3 shows MM/DD/YYYY while the tenant form reads day-first dates

This issue covers **33 unique reports** from support ticket #4471, across 3 tenants. It is a local draft; the export is a snapshot through 2026-10-04, not a current desk count.

The booking-v3 form prints MM/DD/YYYY, but parses input using the day-first tenant locale. Only the form channel with booking-v3 follows this path. Changing the shared parser alone does not repair this misleading hint.

The count is computed from reports-4471.json after deduplication by report id, using tenant locale and form from tenants/*.json and the channel rule in causes.ts. Browser locale, intake tag and subject are not cause classifiers.

Intake disagrees on 15 reports in this group. 0 desk notes describe a one-day move or timing discrepancy; they remain counted under this exported cause, with their text preserved as unresolved evidence. A timezone/DST cause is not established by this export.

Evidence:

R-41230 (copper.studio, form, received 2026-04-17T22:44:00+02:00):

> My client came on 1 June instead of 6 January. We sorted it out.

R-41241 (alder.physio, form, received 2026-04-21T19:21:00+02:00):

> We had two people show up on 8 June. They were booked for 6 August.

R-41251 (pale.harbour, form, received 2026-04-25T20:48:00+01:00):

> Wednesday 7 January showed as Wednesday 1 July. I moved it myself.

Reproduce through booking-v3 for a day-first tenant: the MM/DD/YYYY hint directs users to enter 04/07/2026 for 7 April, while the form interprets it as 4 July. Align hint and parsing; test booking-v2 and app/email separately.

Done means the affected path is fixed, regression checks pass, and the desk verifies sample reports. No production fix has been applied.

All report ids are in evidence/hint-report-ids.json. The computed page is /kb/incidents/4471-review/. Related analysis covers 412 reports as separate parser and hint problems; the old subject-only merge rule must not be used to combine them again.
