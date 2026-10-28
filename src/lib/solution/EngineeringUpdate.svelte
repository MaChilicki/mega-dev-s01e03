<script lang="ts">
  import update from '#lib/data/engineering-update.json';
  const causes = ['parser', 'hint'] as const;
</script>

<section aria-labelledby="engineering-outcomes" class="outcomes">
  <h2 id="engineering-outcomes">Engineering outcomes</h2>
  <p>The <a href={update.source}>{update.sourceTitle}</a> says support ticket #{update.ticket} closed on {update.closedOn}. The report counts below describe the earlier export, not an open engineering queue.</p>
  <table><thead><tr><th>Cause</th><th>Disposition</th><th>Engineering report</th></tr></thead>
    <tbody>{#each causes as cause}<tr><td><a href={update[cause].issue}>{cause}</a></td><td>{update[cause].status}</td><td>{update[cause].message}</td></tr>{/each}</tbody>
  </table>
  <p>The parser is fixed. The hint is closed because the booking-v3 form was retired; it was not repaired. These are distinct outcomes. The update does not independently explain the timing notes below or establish a timezone/DST cause. Its author and timezone are not declared.</p>
</section>

<style>.outcomes { border-left: 4px solid var(--accent); background: var(--note-bg); padding: 0.5rem 1rem; margin: 1rem 0; }</style>
