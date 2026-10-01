/** Fictional illustration data. Never submitted as research or offered as leads. */
export const PURSUIT_EXAMPLES = [
  {
    id: 'property', name: 'Property & construction', template: 'place',
    signal: 'A district proposes a new growth area.', source: 'Sample NZ planning consultation',
    opening: 'Make a place tangible before the first conversation.',
    unknown: 'Check the original notice, affected businesses and timing.',
    companies: [
      { name: 'Field Property', mark: 'FIELD', role: 'Development & placemaking', opportunity: 'An interactive place concept for early conversations.', headline: 'A place to begin.', support: 'Explore an imagined neighbourhood.' },
      { name: 'Horizon Build', mark: 'HORIZON', role: 'Construction & project planning', opportunity: 'A visual project approach for a potential development team.', headline: 'See the plan take shape.', support: 'From site questions to a proposed approach.' },
    ],
    choices: [
      { name: 'The place', caption: 'Explore the layout before a project is proposed.', items: ['Neighbourhood context', 'Places to gather', 'Questions for the site team'] },
      { name: 'The plan', caption: 'Turn the concept into a plan to discuss.', items: ['Site review', 'Concept options', 'A scope for discussion'] },
      { name: 'Next conversation', caption: 'Prepare a focused introduction with the gaps attached.', items: ['Who to speak with', 'What to show', 'What still needs checking'] },
    ],
  },
  {
    id: 'customer', name: 'Customer journeys', template: 'journey',
    signal: 'A retailer adds click & collect.', source: 'Sample NZ service announcement',
    opening: 'Turn a waiting moment into something useful.',
    unknown: 'Check the actual journey, customer needs and permissions.',
    companies: [
      { name: 'Daily Market', mark: 'DAILY', role: 'Retail & collection', opportunity: 'A useful preparation step while an order is picked.', headline: 'Make the wait useful.', support: 'One small choice. A more useful collection.' },
      { name: 'Neighbour Home', mark: 'NEIGHBOUR', role: 'Home & project supplies', opportunity: 'A project check customers can choose before collection.', headline: 'Ready for the whole job.', support: 'Help someone finish what they came to do.' },
    ],
    choices: [
      { name: 'Project check', caption: 'One answer changes the prepared checklist.', items: ['Chosen items', 'Check one possible missing item', 'Customer reviews the suggestion'] },
      { name: 'Pickup plan', caption: 'Prepare collection details without changing an order.', items: ['Collection location', 'What to bring', 'A question for the store'] },
      { name: 'Keep waiting', caption: 'The customer can skip the optional step.', items: ['Order unchanged', 'No extra sharing', 'Wait for the collection notice'] },
    ],
  },
  {
    id: 'services', name: 'Professional services', template: 'brief',
    signal: 'An industry body consults on reporting.', source: 'Sample NZ consultation paper',
    opening: 'Make a technical change clear to the people it affects.',
    unknown: 'Check the proposal, its scope and any actual obligations.',
    companies: [
      { name: 'Forma Advisory', mark: 'FORMA', role: 'Advisory & client services', opportunity: 'An interactive client guide and an editable engagement pitch.', headline: 'A clearer next step.', support: 'From a technical change to a useful conversation.' },
      { name: 'Civic Practice', mark: 'CIVIC', role: 'Professional & business services', opportunity: 'A concise briefing experience for a potential client team.', headline: 'Know what to ask.', support: 'A clear brief. A proposed scope. A human review.' },
    ],
    choices: [
      { name: 'Read the brief', caption: 'Separate the proposed change from what is still unknown.', items: ['The proposal', 'Who may be affected', 'What is not confirmed'] },
      { name: 'Shape the scope', caption: 'Show a small, reviewable piece of proposed work.', items: ['Review the source', 'Prepare a client explainer', 'Outline an engagement'] },
      { name: 'Review the pitch', caption: 'Keep the sources, assumptions and next step together.', items: ['Source review', 'Assumptions to check', 'A conversation to propose'] },
    ],
  },
] as const;
