import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyze, type Report, type Tenant } from '../src/lib/solution/analysis.ts';
import { issueBody, titles } from '../src/lib/solution/presentation.ts';

const root = resolve(process.argv[2] || fileURLToPath(new URL('../', import.meta.url)));
const data = join(root, 'src/lib/data');
const json = async <T>(path: string): Promise<T> => JSON.parse(await readFile(path, 'utf8'));
const reports = await json<Report[]>(join(data, 'reports-4471.json'));
const tenants = await Promise.all((await readdir(join(data, 'tenants'))).filter(n => n.endsWith('.json')).sort()
  .map(n => json<Tenant>(join(data, 'tenants', n))));
const notes = await json<{oneDayMove: string[]}>(join(data, 'desk-notes.json'));
const result = analyze(reports, tenants, notes.oneDayMove);
await mkdir(join(root, 'evidence'), {recursive:true});
await mkdir(join(root, 'issues'), {recursive:true});
await writeFile(join(root, 'evidence/analysis.json'), JSON.stringify(result,null,2)+'\n');
for(const group of result.groups) {
  await writeFile(join(root, `evidence/${group.cause}-report-ids.json`), JSON.stringify(group.ids,null,2)+'\n');
  await writeFile(join(root, `issues/${group.cause}.md`), `# ${titles[group.cause]}\n\n${issueBody(result,group.cause)}`);
}
console.log(JSON.stringify({total:result.total,groups:result.groups.map(g=>({cause:g.cause,count:g.count})),tagMismatches:result.tagMismatches,oneDayNotes:result.oneDayNotes.length},null,2));
console.log('Local evidence and issue drafts updated. Run npm run build to refresh the page. No publishing or course claim was performed.');
