# Shared date parser reads day-first tenant dates as MM/DD

This issue covers **379 unique reports** from support ticket #4471, across 11 tenants. It is a local draft; the export is a snapshot through 2026-10-04, not a current desk count.

The shared parser assumes month-first input for a day-first tenant. This applies to app/email and booking-v2 form reports. An app report from a booking-v3 tenant still follows this parser path.

The count is computed from reports-4471.json after deduplication by report id, using tenant locale and form from tenants/*.json and the channel rule in causes.ts. Browser locale, intake tag and subject are not cause classifiers.

Intake disagrees on 23 reports in this group. 5 desk notes describe a one-day move or timing discrepancy; they remain counted under this exported cause, with their text preserved as unresolved evidence. A timezone/DST cause is not established by this export.

Evidence:

R-41200 (harbour.dental, app, received 2026-04-01T09:12:00+01:00):

> Our 7 April reminder went out on 4 July. Is this a joke. It is not April Fools where we are.

R-41201 (harbour.dental, app, received 2026-04-01T09:34:00+01:00):

> Sorry. 4 July went out on 7 April. I have been up since five.

R-41202 (kettle.books, email, received 2026-04-02T10:41:00+02:00):

> Invite says Tuesday 12 May. Calendar says Monday 11 May. My client turned up on the Monday. We had coffee.

Reproduce with a day-first tenant through app/email or booking-v2: input 07/04/2026 must mean 7 April, and must not become 4 July. Test the parser with both ambiguous and unambiguous dates and validate generated invites.

Done means the affected path is fixed, regression checks pass, and the desk verifies sample reports. No production fix has been applied.

All report ids are in evidence/parser-report-ids.json. The computed page is /kb/incidents/4471-review/. Related analysis covers 412 reports as separate parser and hint problems; the old subject-only merge rule must not be used to combine them again.
