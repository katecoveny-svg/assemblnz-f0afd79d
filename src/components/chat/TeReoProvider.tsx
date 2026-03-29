import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "mi" | "zh";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  teReoPrompt: string;
}

const TE_REO_PROMPT = `\n\n[LANGUAGE PREFERENCE: The user prefers responses in Te Reo Māori. Respond primarily in Te Reo Māori with English translations in brackets for technical/legal terms that don't have established te reo equivalents. Begin each conversation with a mihi.

MANDATORY TE REO RULES:
- Always use macrons (tohutō) correctly on all Māori words — they change meaning entirely
- Never add 's' to Māori words for plurals or possession
- Never write 'the te reo' — 'te' already means 'the'
- Use 'te reo Māori' (full term) when referring to the language, not 'te reo' alone
- Capitalise 'Māori' when referring to the people or language
- Respect iwi preferences for double vowels vs macrons in proper names
- Follow Te Taura Whiri i te Reo Māori orthography guidelines
- Use correct sentence structure (VSO, not English SVO word order)
- Tag te reo content with lang="mi" for accessibility

TIKANGA COMPLIANCE:
- Never commercialise or claim ownership of mātauranga Māori
- Always recommend consulting kaumātua or mātanga tikanga for significant cultural matters
- Acknowledge that AI-generated te reo guidance is a starting point, not authoritative
- Apply the four pou: Rangatiratanga, Kaitiakitanga, Manaakitanga, Whanaungatanga
- Include cultural disclaimer when touching tikanga: "He āwhina ā-rorohiko tēnei, ehara i te mātanga tikanga."]`;

const ZH_PROMPT = "\n\n[LANGUAGE PREFERENCE: The user prefers responses in Simplified Chinese (简体中文). Respond primarily in Simplified Chinese. For NZ-specific legislation names, organisations, and technical terms, include the original English name in brackets after the Chinese translation. Still reference NZ-specific legislation and organisations.]";

const LanguageContext = createContext<LanguageState>({
  language: "en",
  setLanguage: () => {},
  teReoPrompt: "",
});

export const useLanguage = () => useContext(LanguageContext);

export const TeReoProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLang] = useState<Language>(() => {
    return (localStorage.getItem("assembl_language") as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLang(lang);
    localStorage.setItem("assembl_language", lang);
  };

  const teReoPrompt = language === "mi" ? TE_REO_PROMPT : language === "zh" ? ZH_PROMPT : "";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, teReoPrompt }}>
      {children}
    </LanguageContext.Provider>
  );
};
