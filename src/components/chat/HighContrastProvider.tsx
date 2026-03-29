import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface HighContrastState {
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const HighContrastContext = createContext<HighContrastState>({
  highContrast: false,
  toggleHighContrast: () => {},
});

export const useHighContrast = () => useContext(HighContrastContext);

export const HighContrastProvider = ({ children }: { children: ReactNode }) => {
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("assembl_high_contrast") === "true";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
    localStorage.setItem("assembl_high_contrast", String(highContrast));
  }, [highContrast]);

  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  return (
    <HighContrastContext.Provider value={{ highContrast, toggleHighContrast }}>
      {children}
    </HighContrastContext.Provider>
  );
};
