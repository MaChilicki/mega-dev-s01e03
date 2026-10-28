# S01E03: support ticket #4471

This repository contains the runnable TypeScript analysis, two engineering issue drafts and the actual rendered knowledge base for the MEGA.dev exercise.

Run `npm ci --ignore-scripts`, `npm run analyze` and `npm run build`. Open `npm run preview -- --port 4183`, then `/kb/incidents/4471-review/`. Node.js 24 is used for native TypeScript execution.

[Solution and evidence](SOLUTION.md) explain the two causes and the unresolved timing notes. The source page is `src/routes/kb/incidents/4471-review/+page.svx`; its actual rendered output is `build/kb/incidents/4471-review/index.html`.

The course-issued signature in the page frontmatter identifies this submission. It is used only as the public proof required by this exercise; authentication credentials and private course request/response logs are excluded.

---

# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.
