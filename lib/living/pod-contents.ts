/** Fixed CAD illustrations, separate from the customer's configured product. */
export const POD_CONTENTS_NOTE = 'Concept renders. Everyday contents are illustrative and not supplied. Physical fit, lid closure and performance have not been tested.';

export const POD_CONTENTS: Record<string, { image: string; label: string }[]> = {
  'al-pod-standard': [
    { image: 'pods-fish', label: 'Tackle insert · tomato pod · example fishing tackle' },
    { image: 'pods-tech', label: 'Tech insert · sky pod · example earbuds case and cable' },
    { image: 'pods-beach', label: 'Beach insert · butter pod · example balm tins and house keys' },
  ],
  'al-pod-mini': [{ image: 'pods-mini-earbuds', label: 'Earbuds insert · tangerine pod · example earbuds case' }],
  'al-pod-tall': [{ image: 'pods-cards', label: 'Cards insert · ink pod · four example cards' }],
  'al-pod-long': [{ image: 'pods-pens', label: 'Pens insert · mint pod · example stationery' }],
};
