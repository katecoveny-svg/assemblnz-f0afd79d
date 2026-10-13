/** Reusable demonstration data only. No owner identity, cookies, storage or personal fixture imports. */
export type FamilyDemoTab = 'week' | 'rides' | 'kitchen' | 'money' | 'inbox' | 'genome';
export const FAMILY_DEMO = Object.freeze({
  label: 'Fictional family demonstration',
  people: Object.freeze([
    { id: 'example-adult-a', name: 'Example adult A', role: 'Fictional adult' },
    { id: 'example-adult-b', name: 'Example adult B', role: 'Fictional adult' },
    { id: 'example-child-a', name: 'Example child A', role: 'Fictional child' },
    { id: 'example-child-b', name: 'Example child B', role: 'Fictional child' },
  ]),
  sections: Object.freeze({
    week: { title: 'An example week', text: 'A fictional school notice becomes a draft checklist for an adult to review.', items: ['Review the example notice', 'Choose who will handle the example task', 'Check the draft before sharing'] },
    rides: { title: 'Example pickup planning', text: 'A fictional pickup can show a proposed driver and backup. No real location or custody schedule is used.', items: ['Example pickup: adult review needed', 'Driver: not assigned', 'Backup: not assigned'] },
    kitchen: { title: 'An example shopping list', text: 'A small fictional list illustrates how a household could review its weekly needs.', items: ['Example item: bread', 'Example item: apples', 'Example item: rice'] },
    money: { title: 'Example payment review', text: 'This demonstration has no financial records, account connection or payment action.', items: ['No real balance', 'No payment scheduled', 'No purchase made'] },
    inbox: { title: 'An example notice', text: 'Synthetic notice: please review the fictional activity checklist before Friday.', items: ['No inbox connected', 'No uploaded documents', 'No message sent'] },
    genome: { title: 'Example household context', text: 'Only the fictional people shown here belong to this demonstration. No saved household context is loaded.', items: ['Synthetic fixtures only', 'No health or identity records', 'No account memory'] },
  }),
});
export function familyDemoSection(tab: unknown) {
  return typeof tab === 'string' && Object.hasOwn(FAMILY_DEMO.sections, tab)
    ? FAMILY_DEMO.sections[tab as FamilyDemoTab]
    : FAMILY_DEMO.sections.week;
}
