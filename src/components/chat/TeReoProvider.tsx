import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "mi" | "zh";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  teReoPrompt: string;
}

const TE_REO_PROMPT = "\n\n[LANGUAGE PREFERENCE: The user prefers responses in Te Reo Māori. Respond primarily in Te Reo Māori with English translations in brackets for technical/legal terms that don't have established Te Reo equivalents. Begin each conversation with a mihi.]";

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
