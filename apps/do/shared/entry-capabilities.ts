/** Presentation only. Prompts never grant provider, calendar or execution permission. */
export const DO_ENTRY_IDEAS = [
  { id: 'school', name: 'School & household', prompt: 'Turn this notice into next steps', detail: 'Dates, things to bring and a reply to review.', status: 'Draft from your notes' },
  { id: 'agenda', name: 'My day & week', prompt: 'Help me plan the week ahead', detail: 'Draft a daily or weekly briefing from dates and notes you add. Connected calendar agendas and proactive briefings are not live here.', status: 'Planning only' },
  { id: 'bills', name: 'Bills & savings', prompt: 'Review my bills', detail: 'Compare details you supply and draft questions. No bank connection or verified savings.', status: 'Review only' },
  { id: 'shop', name: 'Shop', prompt: 'Plan this week’s shop', detail: 'Meals, a list and a budget to check. No purchases.', status: 'Planning only' },
  { id: 'travel', name: 'Travel', prompt: 'Organise a weekend away', detail: 'Options, a budget and a packing list. No bookings or live availability.', status: 'Planning only' },
  { id: 'pets', name: 'Pets', prompt: 'Make a plan for my pet’s care', detail: 'Organise your own routines and questions for a vet. No medical advice or appointments.', status: 'Draft from your notes' },
  { id: 'car', name: 'Car', prompt: 'Organise my car’s next service and key dates', detail: 'Check dates from your documents and prepare an enquiry. No vehicle lookup or booking.', status: 'Planning only' },
  { id: 'property', name: 'Home & property', prompt: 'Plan the jobs around my home', detail: 'Sort repairs, a moving list or questions for a tradie. No quotes or orders placed.', status: 'Planning only' },
  { id: 'writing', name: 'Writing & meetings', prompt: 'Turn my notes into a clear reply or meeting agenda', detail: 'Draft from text you add. Meeting capture is a separate tool with its own permissions.', status: 'Draft from your notes' },
] as const;
export const DO_TOOL_LINKS = [
  { href: '/do/family', label: 'School briefing', limit: 'Fictional pilot; no connected school inbox' },
  { href: '/do/meetings', label: 'Meeting notes · sign in', limit: 'Capture and sharing need your permission' },
  { href: '/do/messages', label: 'Conversations and replies', limit: 'Review replies before sharing' },
  { href: '/do/bills', label: 'Bills · examples and CSV', limit: 'Demo or your CSV; no live bank connection' },
  { href: '/do/builder', label: 'Builder · prepare a plan', limit: 'Advanced planning workspace' },
  { href: '/do/household', label: 'Household · sample workspace', limit: 'Sample data, not your household' },
  { href: '/creative-studio/voices', label: 'Voice studio', limit: 'Separate voice tools' },
  { href: '/do/enquiries', label: 'Enquiry replies · private pilot', limit: 'Restricted pilot access' },
] as const;
