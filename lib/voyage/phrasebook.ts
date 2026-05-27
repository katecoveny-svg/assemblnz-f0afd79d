// Offline-fallback phrasebook for the voyage-italy translator.
//
// These 30 phrases load instantly with no network and seed the saved-phrases
// section so the page is useful even if Gemini is down or the user is on
// a plane / spotty Wi-Fi.
//
// Categories match marketing/voyage-italy/kate-adrian-seed-2026.json →
// translatorPreferences.phrasebookCategories.

export type PhrasebookCategory =
  | 'greetings'
  | 'restaurant'
  | 'directions'
  | 'emergencies'
  | 'shopping'
  | 'transport';

export type PhrasebookEntry = {
  category: PhrasebookCategory;
  en: string;
  it: string;
  /** Loose ASCII pronunciation hint for English readers. Best-effort only. */
  pronounce?: string;
};

export const PHRASEBOOK_CATEGORY_LABELS: Record<PhrasebookCategory, string> = {
  greetings: 'Greetings',
  restaurant: 'Restaurant',
  directions: 'Directions',
  emergencies: 'Emergencies',
  shopping: 'Shopping',
  transport: 'Transport',
};

export const PRE_SEEDED_PHRASEBOOK: PhrasebookEntry[] = [
  // Greetings — 5
  { category: 'greetings', en: 'Hello', it: 'Ciao', pronounce: 'chow' },
  {
    category: 'greetings',
    en: 'Good morning',
    it: 'Buongiorno',
    pronounce: 'bwon-JOR-noh',
  },
  {
    category: 'greetings',
    en: 'Good evening',
    it: 'Buonasera',
    pronounce: 'bwo-nah-SEH-rah',
  },
  { category: 'greetings', en: 'Thank you', it: 'Grazie', pronounce: 'GRAH-tsyeh' },
  {
    category: 'greetings',
    en: 'Excuse me / sorry',
    it: 'Mi scusi',
    pronounce: 'mee SKOO-zee',
  },

  // Restaurant — 6
  {
    category: 'restaurant',
    en: 'A table for two, please',
    it: 'Un tavolo per due, per favore',
    pronounce: 'oon TAH-vo-loh pehr DOO-eh',
  },
  {
    category: 'restaurant',
    en: 'The menu, please',
    it: 'Il menù, per favore',
    pronounce: 'eel meh-NOO',
  },
  {
    category: 'restaurant',
    en: 'I am vegetarian',
    it: 'Sono vegetariana',
    pronounce: 'SO-no veh-jeh-tah-RYAH-nah',
  },
  {
    category: 'restaurant',
    en: 'Still water, please',
    it: 'Acqua naturale, per favore',
    pronounce: 'AH-kwa na-too-RAH-leh',
  },
  {
    category: 'restaurant',
    en: 'The bill, please',
    it: 'Il conto, per favore',
    pronounce: 'eel KOHN-toh',
  },
  {
    category: 'restaurant',
    en: 'Delicious!',
    it: 'Buonissimo!',
    pronounce: 'bwoh-NEES-see-moh',
  },

  // Directions — 5
  {
    category: 'directions',
    en: 'Where is the bathroom?',
    it: 'Dov’è il bagno?',
    pronounce: 'do-VEH eel BAH-nyo',
  },
  {
    category: 'directions',
    en: 'How do I get to the station?',
    it: 'Come arrivo alla stazione?',
    pronounce: 'KOH-meh ah-REE-voh AH-lah staht-SYOH-neh',
  },
  {
    category: 'directions',
    en: 'On the left',
    it: 'A sinistra',
    pronounce: 'ah see-NEES-trah',
  },
  {
    category: 'directions',
    en: 'On the right',
    it: 'A destra',
    pronounce: 'ah DEH-strah',
  },
  {
    category: 'directions',
    en: 'Straight ahead',
    it: 'Sempre dritto',
    pronounce: 'SEM-preh DREE-toh',
  },

  // Emergencies — 4
  {
    category: 'emergencies',
    en: 'Help!',
    it: 'Aiuto!',
    pronounce: 'ah-YOO-toh',
  },
  {
    category: 'emergencies',
    en: 'Call the police',
    it: 'Chiami la polizia',
    pronounce: 'KYAH-mee lah poh-leet-SEE-ah',
  },
  {
    category: 'emergencies',
    en: 'I need a doctor',
    it: 'Ho bisogno di un medico',
    pronounce: 'oh bee-ZOH-nyoh dee oon MEH-dee-koh',
  },
  {
    category: 'emergencies',
    en: 'I have lost my passport',
    it: 'Ho perso il passaporto',
    pronounce: 'oh PEHR-soh eel pah-sah-POR-toh',
  },

  // Shopping — 5
  {
    category: 'shopping',
    en: 'How much does this cost?',
    it: 'Quanto costa?',
    pronounce: 'KWAN-toh KOH-stah',
  },
  {
    category: 'shopping',
    en: 'Do you accept credit cards?',
    it: 'Accettate carte di credito?',
    pronounce: 'ah-cheh-TAH-teh KAR-teh dee KREH-dee-toh',
  },
  {
    category: 'shopping',
    en: 'I am just looking, thanks',
    it: 'Sto solo guardando, grazie',
    pronounce: 'stoh SOH-loh gwar-DAHN-doh',
  },
  {
    category: 'shopping',
    en: 'Too expensive',
    it: 'Troppo caro',
    pronounce: 'TROH-poh KAH-roh',
  },
  {
    category: 'shopping',
    en: 'A bag, please',
    it: 'Una busta, per favore',
    pronounce: 'OO-nah BOO-stah',
  },

  // Transport — 5
  {
    category: 'transport',
    en: 'One ticket to Rome',
    it: 'Un biglietto per Roma',
    pronounce: 'oon bee-LYET-toh pehr ROH-mah',
  },
  {
    category: 'transport',
    en: 'Which platform?',
    it: 'Quale binario?',
    pronounce: 'KWAH-leh bee-NAH-ryoh',
  },
  {
    category: 'transport',
    en: 'Is this seat free?',
    it: 'È libero questo posto?',
    pronounce: 'eh LEE-beh-roh KWEH-stoh POH-stoh',
  },
  {
    category: 'transport',
    en: 'I would like a taxi',
    it: 'Vorrei un taxi',
    pronounce: 'voh-RAY oon TAHK-see',
  },
  {
    category: 'transport',
    en: 'Stop here, please',
    it: 'Si fermi qui, per favore',
    pronounce: 'see FEHR-mee kwee',
  },
];

/** Phrasebook entries grouped by category, in display order. */
export function groupPhrasebook(entries: PhrasebookEntry[] = PRE_SEEDED_PHRASEBOOK) {
  const order: PhrasebookCategory[] = [
    'greetings',
    'restaurant',
    'directions',
    'emergencies',
    'shopping',
    'transport',
  ];
  return order
    .map((cat) => ({
      category: cat,
      label: PHRASEBOOK_CATEGORY_LABELS[cat],
      entries: entries.filter((e) => e.category === cat),
    }))
    .filter((group) => group.entries.length > 0);
}
